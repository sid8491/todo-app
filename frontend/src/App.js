import React, { useState, useEffect } from 'react';
import './assets/style.css';
// import './assets/tasks'

function App() {
  const [todoList, setTodoList] = useState([]);
  const [activeItem, setActiveItem] = useState({
    id: null,
    title: '',
    completed: false
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  const fetchTasks = () => {
    console.log('fetching...');
    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(response => response.json())
    .then((data) => {
      setTodoList(data)
    })
  }

  const handleChange = (e) => {
    let value = e.target.value;
    setActiveItem({...activeItem, title:value})
  }

  const handleSubmit= (e) => {
    e.preventDefault()
    const csrfToken = getCookie('csrftoken');
    const createUrl = `http://127.0.0.1:8000/api/task-create/`
    const updateUrl = `http://127.0.0.1:8000/api/task-update/${activeItem.id}/`
    const url = editing === true ? updateUrl : createUrl;
    if (editing === true) {
      setEditing(false);
    }
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(activeItem)
    })
    .then(response => {
      fetchTasks();
      setActiveItem({
        id: null,
        title: '',
        completed: false
      })
    })
    .catch((error) => {
      console.log(`error: ${error}`);
    })
  }

  const startEdit = (task) => {
    setActiveItem(task);
    setEditing(true);
  }

  const deleteItem = (item) => {
    const csrfToken = getCookie('csrftoken');
    const url = `http://127.0.0.1:8000/api/task-delete/${item}/`
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrfToken,
      }
    }).then((response) => {
      fetchTasks();
    })
  }

  const toggleCompleted = (task) => {
    task.completed = !task.completed;
    const csrfToken = getCookie('csrftoken');
    const updateUrl = `http://127.0.0.1:8000/api/task-update/${task.id}/`
    fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(task)
    })
    .then(response => {
      fetchTasks();
    })
    .catch((error) => {
      console.log(`error: ${error}`);
    })
  }

  return (
    <div className="container">
      <div id="task-container">
        <div id="form-wrapper">
          <form id="form">
            <div className="flex-wrapper">
              <div style={{flex: 6}}>
                <input onChange={handleChange} id="title" className="form-control" type="text" name="title" placeholder="Add task" value={activeItem.title} />
              </div>
              <div style={{flex: 1}}>
                <input onClick={handleSubmit} id="submit" className="btn" type="submit" />
              </div>
            </div>
          </form>
        </div>

        <div id="list-wrapper">
          {todoList.map((task, index) => (
            <div key={index} className='task-wrapper flex-wrapper'>
              <div onClick={() => toggleCompleted(task)} style={{flex: 7}}>{task.completed === true ? (
                <strike>{task.title}</strike>
                ) : (
                  <span>{task.title}</span>
                )}</div>
              <div style={{flex: 1}}>
                  {
                    task.completed
                    ? <input onClick={() => toggleCompleted(task)} type="checkbox" className="form-check-input completed" id="checkbox-done" name="checkbox-done" checked />
                    : <input onClick={() => toggleCompleted(task)} type="checkbox" className="form-check-input completed" id="checkbox-done" name="checkbox-done" />
                  }
              </div>
              <div style={{flex: 1}}>
                  <button onClick={() => startEdit(task)} className="btn btn-sm btn-outline-info edit">Edit </button>
              </div>
              <div style={{flex: 1}}>
                  <button onClick={() => deleteItem(task.id)} className="btn btn-sm btn-outline-dark delete">-</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
