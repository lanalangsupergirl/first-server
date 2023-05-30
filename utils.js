export function openDb(dbname, path) {
  return new dbname.Database(path, dbname.OPEN_READWRITE, (err) => {
    if (err) {
      process.stderr.write(err);
      return;
    }
  });
}

export function errorHandler(err) {
  if (err) {
    console.log(err); //throw new Error
    return;
  }
}
