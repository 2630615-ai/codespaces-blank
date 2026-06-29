const STORAGE_KEY = 'my_todos_v1'

const qs = (sel) => document.querySelector(sel)
const taskForm = qs('#task-form')
const taskInput = qs('#task-input')
const taskList = qs('#task-list')
const countEl = qs('#count')
const filtersEl = qs('#filters')
const clearBtn = qs('#clear-completed')

let tasks = []
let filter = 'all'

function load(){
  try{ tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }catch(e){ tasks = [] }
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

function render(){
  taskList.innerHTML = ''
  const visible = tasks.filter(t => filter === 'all' ? true : filter === 'active' ? !t.done : t.done)
  visible.forEach(t => {
    const li = document.createElement('li')
    li.className = 'task-item' + (t.done ? ' completed' : '')

    const cb = document.createElement('input')
    cb.type = 'checkbox'
    cb.checked = !!t.done
    cb.addEventListener('change', ()=>{ t.done = cb.checked; save(); render(); })

    const label = document.createElement('label')
    label.className = 'title'
    label.textContent = t.text
    label.addEventListener('dblclick', ()=> startEdit(t, label))

    const actions = document.createElement('div')
    actions.className = 'actions'

    const del = document.createElement('button')
    del.className = 'btn'
    del.textContent = '삭제'
    del.addEventListener('click', ()=>{ tasks = tasks.filter(x=>x.id!==t.id); save(); render(); })

    actions.appendChild(del)

    li.appendChild(cb)
    li.appendChild(label)
    li.appendChild(actions)
    taskList.appendChild(li)
  })

  countEl.textContent = tasks.length
  Array.from(filtersEl.children).forEach(b=>b.classList.toggle('active', b.dataset.filter === filter))
}

function startEdit(task, labelEl){
  const input = document.createElement('input')
  input.value = task.text
  input.className = 'edit-input'
  labelEl.replaceWith(input)
  input.focus()
  input.setSelectionRange(input.value.length, input.value.length)

  function finish(){
    const v = input.value.trim()
    if(v) task.text = v
    else tasks = tasks.filter(x=>x.id!==task.id)
    save(); render()
  }

  input.addEventListener('blur', finish)
  input.addEventListener('keydown', e=>{ if(e.key==='Enter') input.blur(); if(e.key==='Escape'){ render() } })
}

taskForm.addEventListener('submit', e=>{
  e.preventDefault()
  const v = taskInput.value.trim()
  if(!v) return
  tasks.unshift({ id: uid(), text: v, done: false })
  taskInput.value = ''
  save(); render()
})

filtersEl.addEventListener('click', e=>{
  const b = e.target.closest('button')
  if(!b) return
  filter = b.dataset.filter
  render()
})

clearBtn.addEventListener('click', ()=>{
  tasks = tasks.filter(t => !t.done)
  save(); render()
})

load(); render()
