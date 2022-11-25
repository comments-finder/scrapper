db.createUser(
    {
        user: "scrapper",
        pwd: "123456",
        roles: [
            {
                role: "readWrite",
                db: "scrapper"
            }
        ]
    }
);
