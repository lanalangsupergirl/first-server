for (let i = 0; i < recipe.categories.length; i++) {
    let current = recipe.categories[i];
    if (categories.includes(current)) {
        continue;
    }

    categories.push(current);

    db.run("INSERT INTO categories(name) VALUES (?)", [current], (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
}

function method(arg) {
    if (arg <= 100) {
        return
    }

    if (arg > 100) {
        // 100 lines of code
    }

}