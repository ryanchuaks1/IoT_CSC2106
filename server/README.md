To test your Express server and the CRUD operations, you can use tools like `curl`

**Testing with curl:**

   - **Get all items:**
     ```bash
     curl http://localhost:5000/items
     ```

   - **Get a single item by ID:**
     ```bash
     curl http://localhost:5000/items/1
     ```

   - **Create a new item:**
     ```bash
     curl -X POST -H "Content-Type: application/json" -d "{\"name\": \"New Item\"}" http://localhost:5000/items
     ```

   - **Update an item by ID:**
     ```bash
     curl -X PUT -H "Content-Type: application/json" -d "{\"name\": \"Updated Item\"}" http://localhost:5000/items/1
     ```

   - **Delete an item by ID:**
     ```bash
     curl -X DELETE http://localhost:5000/items/1
     ```