import { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { SaleModel } from '../modals/sale.model';
import { ProductModel } from '../modals/product.model';
import { InventoryTransactionModel } from '../modals/inventoryTransaction.model';

const buildInvoice = (sale: any) => ({
    id: sale._id.toString(),
    invoiceNo: sale.invoiceNo,
    date: sale.date,
    customerId: sale.customerId,
    items: sale.items.map((it: any) => ({
        sku: it.sku,
        name: it.name,
        qty: it.qty,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
    })),
    subtotal: sale.subtotal,
    tax: sale.tax,
    total: sale.total,
});

const generateInvoicePDF = async (invoice: any) => {
    const invoicesDir = path.resolve(__dirname, '../../invoices');
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
    const invoicePath = path.join(invoicesDir, `${invoice.id}.pdf`);

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    // ── Layout constants ──────────────────────────────────────
    const W = doc.page.width;   // 595.28
    const H = doc.page.height;  // 841.89
    const MARGIN = 48;
    const CONTENT_W = W - MARGIN * 2;

    // ── Colour palette ────────────────────────────────────────
    const C = {
        brand:      '#1e3a5f',   // deep navy
        brandMid:   '#2563eb',   // blue accent
        accent:     '#f59e0b',   // amber – used on totals / highlight
        dark:       '#111827',
        mid:        '#374151',
        gray:       '#6b7280',
        lightGray:  '#f3f4f6',
        border:     '#e5e7eb',
        white:      '#ffffff',
        rowEven:    '#f8fafc',
    };

    // ── Helpers ───────────────────────────────────────────────
    const invoiceNo = (invoice.invoiceNo || invoice.id.slice(-8)).toString().toUpperCase();
    const customerName =
        typeof invoice.customerId === 'object'
            ? invoice.customerId?.name ?? 'Customer'
            : invoice.customerId ?? 'Customer';
    const invoiceDate = new Date(invoice.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const dueDate = new Date(new Date(invoice.date).getTime() + 30 * 864e5)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // ─────────────────────────────────────────────────────────
    // HEADER  (full-width navy band, 110 px tall)
    // ─────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 110).fill(C.brand);

    // Company name – left
    doc.fill(C.white).fontSize(20).font('Helvetica-Bold')
       .text('YOUR COMPANY', MARGIN, 30, { width: 260 });
    doc.fill('#93c5fd').fontSize(8.5).font('Helvetica')
       .text('Inventory & Sales Management', MARGIN, 55);

    // "INVOICE" badge – right
    const badgeW = 148;
    const badgeX = W - MARGIN - badgeW;
    doc.rect(badgeX, 22, badgeW, 40).fill(C.accent);
    doc.fill(C.white).fontSize(18).font('Helvetica-Bold')
       .text('INVOICE', badgeX, 33, { width: badgeW, align: 'center' });

    // Invoice number + date under badge
    doc.fill('#bfdbfe').fontSize(8).font('Helvetica-Bold')
       .text(`# ${invoiceNo}`, badgeX, 72, { width: badgeW, align: 'center', characterSpacing: 0.5 });

    // ─────────────────────────────────────────────────────────
    // META ROW  (three info blocks)
    // ─────────────────────────────────────────────────────────
    const metaY = 126;

    // Thin accent bar
    doc.rect(0, 110, W, 5).fill(C.brandMid);

    const label = (txt: string, x: number, y: number, w: number) => {
        doc.fill(C.gray).fontSize(7).font('Helvetica-Bold')
           .text(txt.toUpperCase(), x, y, { width: w, characterSpacing: 0.8 });
    };
    const value = (txt: string, x: number, y: number, w: number, opts?: any) => {
        doc.fill(C.dark).fontSize(10).font('Helvetica-Bold')
           .text(txt, x, y + 11, { width: w, ...opts });
    };

    label('Bill To',       MARGIN,           metaY, 160);
    label('Invoice Date',  MARGIN + 220,     metaY, 120);
    label('Due Date',      MARGIN + 360,     metaY, 120);

    value(customerName,    MARGIN,           metaY, 200);
    value(invoiceDate,     MARGIN + 220,     metaY, 120);
    value(dueDate,         MARGIN + 360,     metaY, 120);

    // Divider under meta
    const dividerY = metaY + 42;
    doc.rect(MARGIN, dividerY, CONTENT_W, 1).fill(C.border);

    // ─────────────────────────────────────────────────────────
    // ITEMS TABLE
    // ─────────────────────────────────────────────────────────
    const TABLE_TOP = dividerY + 20;

    // Column x-positions and widths
    const col = {
        name:  { x: MARGIN,           w: 198 },
        sku:   { x: MARGIN + 203,     w: 90  },
        qty:   { x: MARGIN + 298,     w: 52  },
        unit:  { x: MARGIN + 355,     w: 80  },
        total: { x: MARGIN + 440,     w: MARGIN + CONTENT_W - (MARGIN + 440) },
    };

    const drawTableHeader = (y: number) => {
        doc.rect(MARGIN, y, CONTENT_W, 26).fill(C.brand);
        doc.fill(C.white).fontSize(8).font('Helvetica-Bold');
        doc.text('PRODUCT',    col.name.x  + 6, y + 9, { width: col.name.w  });
        doc.text('SKU',        col.sku.x,        y + 9, { width: col.sku.w   });
        doc.text('QTY',        col.qty.x,        y + 9, { width: col.qty.w,  align: 'center' });
        doc.text('UNIT PRICE', col.unit.x,       y + 9, { width: col.unit.w, align: 'right'  });
        doc.text('AMOUNT',     col.total.x,      y + 9, { width: col.total.w,align: 'right'  });
        return y + 26;
    };

    let y = drawTableHeader(TABLE_TOP);

    for (let i = 0; i < invoice.items.length; i++) {
        const it = invoice.items[i];
        const ROW_H = 28;

        // Page-break guard (leave room for totals + footer)
        if (y + ROW_H > H - 180) {
            doc.addPage({ margin: 0 });
            y = 50;
            y = drawTableHeader(y);
        }

        // Alternating stripe
        if (i % 2 === 0) doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill(C.rowEven);

        const cellY = y + 9;
        doc.fill(C.dark).font('Helvetica').fontSize(9.5)
           .text(it.name, col.name.x + 6, cellY, { width: col.name.w - 6, ellipsis: true });
        doc.fill(C.gray).fontSize(9)
           .text(it.sku,  col.sku.x,  cellY, { width: col.sku.w  });
        doc.fill(C.dark)
           .text(String(it.qty), col.qty.x, cellY, { width: col.qty.w, align: 'center' });
        doc.text(`$${it.unitPrice.toFixed(2)}`, col.unit.x, cellY, { width: col.unit.w, align: 'right' });
        doc.font('Helvetica-Bold')
           .text(`$${it.lineTotal.toFixed(2)}`, col.total.x, cellY, { width: col.total.w, align: 'right' });

        // Row bottom border
        doc.rect(MARGIN, y + ROW_H - 1, CONTENT_W, 1).fill(C.border);

        y += ROW_H;
    }

    // ─────────────────────────────────────────────────────────
    // TOTALS BLOCK  (bottom-right)
    // ─────────────────────────────────────────────────────────
    const TOTALS_W  = 230;
    const TOTALS_X  = W - MARGIN - TOTALS_W;
    let ty = y + 24;

    const totalsRow = (labelTxt: string, amountTxt: string, bold = false) => {
        const f = bold ? 'Helvetica-Bold' : 'Helvetica';
        doc.font(f).fontSize(9.5)
           .fill(bold ? C.dark : C.gray)
           .text(labelTxt, TOTALS_X, ty, { width: 120 });
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
           .fill(C.dark)
           .text(amountTxt, TOTALS_X + 120, ty, { width: TOTALS_W - 120, align: 'right' });
        ty += 18;
    };

    totalsRow('Subtotal', `$${invoice.subtotal.toFixed(2)}`);
    if (invoice.tax > 0) totalsRow('Tax', `$${invoice.tax.toFixed(2)}`);

    // Divider above grand total
    doc.rect(TOTALS_X, ty, TOTALS_W, 1).fill(C.border);
    ty += 8;

    // Grand total highlighted band
    doc.rect(TOTALS_X - 10, ty - 6, TOTALS_W + 10, 36).fill(C.brand);
    doc.fill(C.white).fontSize(10).font('Helvetica-Bold')
       .text('TOTAL DUE', TOTALS_X, ty + 6, { width: 110 });
    doc.fill(C.accent).fontSize(13).font('Helvetica-Bold')
       .text(`$${invoice.total.toFixed(2)}`, TOTALS_X + 110, ty + 5, { width: TOTALS_W - 110, align: 'right' });

    // ─────────────────────────────────────────────────────────
    // NOTES / PAYMENT TERMS  (left of totals block)
    // ─────────────────────────────────────────────────────────
    const notesX = MARGIN;
    const notesW = TOTALS_X - MARGIN - 20;
    doc.fill(C.gray).fontSize(7.5).font('Helvetica-Bold')
       .text('PAYMENT TERMS', notesX, y + 24, { width: notesW, characterSpacing: 0.6 });
    doc.fill(C.mid).fontSize(8.5).font('Helvetica')
       .text('Payment is due within 30 days of the invoice date.\nPlease include the invoice number on your payment.',
             notesX, y + 36, { width: notesW, lineGap: 3 });

    // ─────────────────────────────────────────────────────────
    // FOOTER
    // ─────────────────────────────────────────────────────────
    const FOOTER_H = 52;
    const footerY  = H - FOOTER_H;

    doc.rect(0, footerY, W, FOOTER_H).fill(C.lightGray);
    doc.rect(0, footerY, W, 1).fill(C.border);

    // Left – thank-you
    doc.fill(C.brand).fontSize(9).font('Helvetica-Bold')
       .text('Thank you for your business!', MARGIN, footerY + 14, { width: 220 });

    // Center – invoice reference
    doc.fill(C.gray).fontSize(7.5).font('Helvetica')
       .text(`Invoice # ${invoiceNo}`, 0, footerY + 20, { width: W, align: 'center' });

    // Right – generated date
    doc.fill(C.gray).fontSize(7.5).font('Helvetica')
       .text(`Generated ${new Date().toLocaleDateString()}`, W - MARGIN - 150, footerY + 14, { width: 150, align: 'right' });

    doc.end();
    await new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
    return invoicePath;
};

// ── Business logic (unchanged) ─────────────────────────────────────────────

const postSaleLogic = async (saleId: string) => {
    const session = await mongoose.startSession();
    let useTransaction = true;
    try {
        session.startTransaction();
    } catch {
        useTransaction = false;
    }
    try {
        const sale = await SaleModel.findById(saleId)
            .populate('customerId', 'name')
            .session(session);
        if (!sale) {
            if (useTransaction) await session.abortTransaction();
            throw new Error('sale not found');
        }
        if (sale.status === 'posted') {
            if (useTransaction) await session.abortTransaction();
            throw new Error('already posted');
        }

        for (const item of sale.items) {
            const updatedProd = await ProductModel.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.qty } },
                { $inc: { stock: -item.qty } },
                { new: true, session }
            );
            if (!updatedProd) {
                if (useTransaction) await session.abortTransaction();
                throw new Error(`insufficient stock for product ${item.productId}`);
            }
            await InventoryTransactionModel.create(
                [{
                    productId:     updatedProd._id,
                    type:          'sale_out',
                    referenceId:   sale._id,
                    qtyChange:     -item.qty,
                    previousStock: updatedProd.stock + item.qty,
                    newStock:      updatedProd.stock,
                }],
                { session }
            );
        }

        sale.status = 'posted';
        await sale.save({ session });
        if (useTransaction) await session.commitTransaction();

        const invoice = buildInvoice(sale);
        const invoicePath = await generateInvoicePDF(invoice);
        return { success: true, data: { sale, invoicePath } };
    } catch (err: any) {
        if (useTransaction) await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

// ── Route handlers (unchanged) ─────────────────────────────────────────────

export const createSale = async (req: Request, res: Response) => {
    try {
        const payload = { ...req.body, status: 'draft' };
        const sale = await SaleModel.create(payload);
        const result = await postSaleLogic(sale._id.toString());
        result.data.sale = sale;
        return res.status(201).json({ success: true, data: result.data });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const updateSale = async (req: Request, res: Response) => {
    try {
        const role = (req.user as any)?.role;
        const sale = await SaleModel.findById(req.params.id);
        if (!sale) return res.status(404).json({ success: false, error: 'not found' });
        if (role === 'clerk' && sale.status !== 'draft') {
            return res.status(403).json({ success: false, error: 'Only managers can modify posted sales' });
        }
        const updated = await SaleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const postSale = async (req: Request, res: Response) => {
    try {
        const result = await postSaleLogic(req.params.id);
        return res.status(200).json({ success: true, data: result.data });
    } catch (err: any) {
        if (err.message === 'sale not found')           return res.status(404).json({ success: false, error: err.message });
        if (err.message === 'already posted')           return res.status(400).json({ success: false, error: err.message });
        if (err.message.includes('insufficient stock')) return res.status(409).json({ success: false, error: err.message });
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const cancelSale = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const sale = await SaleModel.findById(req.params.id).session(session);
        if (!sale) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, error: 'sale not found' });
        }
        if (sale.status !== 'posted') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, error: 'sale not posted' });
        }

        for (const item of sale.items) {
            const prod = await ProductModel.findById(item.productId).session(session);
            if (!prod) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, error: `product ${item.productId} not found` });
            }
            const prev = prod.stock || 0;
            prod.stock = prev + item.qty;
            await prod.save({ session });
            await InventoryTransactionModel.create(
                [{
                    productId:     prod._id,
                    type:          'sale_reversal',
                    referenceId:   sale._id,
                    qtyChange:     item.qty,
                    previousStock: prev,
                    newStock:      prod.stock,
                }],
                { session }
            );
        }

        sale.status = 'cancelled';
        await sale.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ success: true, data: sale });
    } catch (err: any) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    } finally {
        session.endSession();
    }
};

export const downloadInvoice = async (req: Request, res: Response) => {
    const invoicesDir = path.resolve(__dirname, '../../invoices');
    const invoicePath = path.join(invoicesDir, `${req.params.id}.pdf`);
    if (!fs.existsSync(invoicePath)) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    // Look up the sale so we can use its invoiceNo in the filename
    const sale = await SaleModel.findById(req.params.id).lean().catch(() => null);
    const invoiceNo = (sale as any)?.invoiceNo || req.params.id.slice(-6);
    const filename = `invoice-${invoiceNo}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(invoicePath);
};

export const listSales = async (req: Request, res: Response) => {
    const items = await SaleModel.find()
        .populate('customerId', 'name')
        .limit(100)
        .lean();
    return res.status(200).json({ success: true, data: items });
};

export const getSale = async (req: Request, res: Response) => {
    const p = await SaleModel.findById(req.params.id)
        .populate('customerId', 'name email phone')
        .lean();
    if (!p) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(200).json({ success: true, data: p });
};

export default { createSale, updateSale, postSale, cancelSale, listSales, getSale, downloadInvoice };