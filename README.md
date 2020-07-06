# License Plate Auth API
A service that gets an image of a license plate and returns a
decision whether the vehicle may enter a parking lot, determined by pre-defined rules.
Decisions are kept in a PostgreSQL database.


## Using the service
To see last 5,000 decisions, go to https://pacific-river-96380.herokuapp.com/  .

To check a license plate and add the decision into the DB, send a POST requset to:
http://pacific-river-96380.herokuapp.com/license-plate-auth
with a url parameter inside the body in JSON format, 
holding a url to a license plate picture, i.e.:
```
{
    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Plak-IL-Shakhsi-15x30.svg/300px-Plak-IL-Shakhsi-15x30.svg.png"
}
```
  

## Author
* **iMelki** 


