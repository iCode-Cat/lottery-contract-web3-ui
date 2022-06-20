import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import { useEffect, useState } from 'react';
import lottery from './lottery';

function App() {
  const [managerState, setManagerState] = useState('');
  const [players, setPlayers] = useState([]);
  const [Balance, setBalance] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  web3.eth.getAccounts().then(console.log);

  const lotteryManager = async () => {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    setBalance(balance);
    setManagerState(manager);
    setPlayers(players);
  };

  const pickWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    setMessage('Waiting for transaction to be mined...');

    try {
      await lottery.methods.pickWinner().send({
        from: accounts[0],
      });
      setMessage('Winner has been picked!');
      lotteryManager();
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    lotteryManager();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    // get metamask accounts
    const accounts = await web3.eth.getAccounts();
    setMessage('Waiting on transaction success...');
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, 'ether'),
      });
      setMessage('You have been entered!');

      lotteryManager();
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h1>Lottery Contract</h1>
      <p>This contract is managed by {managerState}</p>
      <p>
        There are {players.length} players in this contract, competing to win{' '}
        {web3.utils.fromWei(Balance, 'ether')} ether!
      </p>
      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter:</label>
          <input
            value={value}
            type='number'
            step='0.01'
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button>Enter</button>
      </form>
      <p>{message}</p>
      <h4>Ready to pick the winner?</h4>
      <button onClick={pickWinner}>Pick a winner!</button>
    </div>
  );
}

export default App;
