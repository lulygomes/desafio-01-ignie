const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userExist = users.find(user => user.username === username);

  if(!userExist){
    return response.status(400).json({ error: 'username não encontrado'})
  }

  next()
  
}

app.post('/users',(request, response) => {
  const { name, username } = request.body;

  const userExist = users.find(user => user.username === username);

  if(!!userExist){
    return response.status(400).json({error: 'username já em uso'})
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  return response.status(201).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find(u => u.username === username)

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  let todo = user.todos.find(todo => todo.id === id );

  if(!todo) {
    return response.status(404).json({ error: 'TODO não encontrado'})
  }

  todo = { ...todo, title, deadline: new Date(deadline)}

  return response.status(201).json(todo)  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  let todo = user.todos.find(todo => todo.id === id );

  if(!todo) {
    return response.status(404).json({ error: 'TODO não encontrado'})
  }

  todo = { ...todo, done: true}

  return response.status(201).json(todo)  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id );

  if(!todo) {
    return response.status(404).json({ error: 'TODO não encontrado'})
  }

  const newTodos = user.todos.filter(todo => todo.id !== id);

  user.todos = newTodos

  return response.status(204).send() 
});

module.exports = app;