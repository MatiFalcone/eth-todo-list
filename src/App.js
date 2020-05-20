import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config'
import TodoList from './TodoList'

class App extends Component {

componentWillMount() {
  this.loadBlockchainData()
}

async loadBlockchainData() {
  // Me conecto con la Blockchain a traves de Web3
  const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
  
  // Aparece la pantalla de Metamask (aceptar/rechazar)
     if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Espero que el usuario acepte o rechace
      await window.ethereum.enable();
      // El usuario acepto, ahora las cuentas estan expuestas
      // Reconozco la red a la que estoy conectado
      const network = await web3.eth.net.getNetworkType()
      console.log("Network: ", network)
      // Recupero las cuentas y muestro la primera por pantalla
      const accounts = await web3.eth.getAccounts()
      console.log("Account: ", accounts[0])
      // Lo grabo en el estado
      this.setState({ account: accounts[0] })
      // Instancio el contrato
      const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
      // Lo grabo en el estado
      this.setState({ todoList })
      const taskCount = await todoList.methods.taskCount().call()
      this.setState({ taskCount })
      for (var i = 1; i <= taskCount; i++) {
        const task = await todoList.methods.tasks(i).call()
        this.setState({
          tasks: [...this.state.tasks, task]
        })
      }
      this.setState({ loading: false })
    } catch (error) {
      // El usuario rechazo el acceso de Metamask
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(this.web3.currentProvider);
    // Acccounts always exposed
    this.web3.eth.sendTransaction({/* ... */ });
  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
}

  constructor(props) {
    super(props)
    this.state = { 
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }
    this.createTask = this.createTask.bind(this)
  }

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.dappuniversity.com/free-download" target="_blank">Dapp University | Todo List</a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small><a className="nav-link" href="#"><span id="account"></span></a></small>
          </li>
        </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading 
                ? <div id="loader" className="text-center"> <p className="text-center">Loading...</p> </div> 
                : <TodoList tasks={this.state.tasks} createTask={this.createTask} /> 
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
