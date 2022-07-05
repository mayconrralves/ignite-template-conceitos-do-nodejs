const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(u=>u.username === username);
  if(!user){
    return response.status(400).json({error: 'Mensagem de erro!'});
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user=>user.username === username);
  if(userAlreadyExists){
    return response.status(400).json({error: 'Mensagem de Erro!'});
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(200).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { deadline, title} = request.body;
  const todo = user.todos.find(todo=>todo.id === id);
  if(!todo){
    return response.status(404).json({error: "Mensagem de erro."})
  }
  if(deadline) todo.deadline = deadline;
  if(title) todo.title = title;
  return  response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo =>todo.id === id);
  if(!todo){
    return response.status(404).json({error: 'Mensagem de Erro.'})
  }
  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo=> todo.id === id);
  if(!todo){
    return response.status(404).json({error: 'Mensagem de Erro.'});
  }
  user.todos.splice(todo, 1);
  return response.status(204).json(todo);
});

module.exports = app;