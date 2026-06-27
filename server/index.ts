import app from './src/app';

const PORT = process.env.PORT || 8000;
app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
