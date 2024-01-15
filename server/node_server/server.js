const express = require('express');
const { json } = require('body-parser');

const app = express();
const port = 5000;

// TEMP DATA FOR TESTING
let items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

app.use(json());

// Get all items
app.get('/items', (req, res) => {
  res.json(items);
});

// Get a single item by ID
app.get('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const item = items.find(item => item.id === itemId);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Create a new item
app.post('/items', (req, res) => {
  const newItem = req.body;
  newItem.id = items.length + 1;
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update an item by ID
app.put('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const updatedItem = req.body;

  items = items.map(item => {
    if (item.id === itemId) {
      return { ...item, ...updatedItem, id: itemId };
    }
    return item;
  });

  res.json({ message: 'Item updated successfully' });
});

// Delete an item by ID
app.delete('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  items = items.filter(item => item.id !== itemId);
  res.json({ message: 'Item deleted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
