# podoserver

This project is no longer maintained.


This project requires .env file with jwtSecret, CLOUDINARY_SECRET, and DATABASE_URL.
The website uses noSQL for CRUD, and Cloudinary service to provide images to the website. 

In order to start the development environment:

```
npm install
npm run dev
```

Heroku was used during the development phase, so this project is ready to be deployed to a Heroku server.

From this project I learned:
1. How to fully utilize Redux with React
2. How to securely authenticate users with a cookie token
3. How to implement full CRUD by enabling users to add/edit/delete posts and make/edit/delete comments
4. How to implement Admin page
5. How painful it is to deal with time and date.

Mistakes I made:
1. Client-side folder structure
2. Lack of code refactoring on client-side code
3. Messy initial Redux state
4. Using Redux-form
5. No distinction between presentational and container components
6. No extensive testings on both client/server
7. Using noSQL database on relational data
