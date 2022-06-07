import { ChangeEvent, FormEvent, useState } from 'react';
import { io } from 'socket.io-client';

import './app.css';
import { IMessage } from './interfaces/IMessage';

const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [name, setName] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [typingDisplay, setTypingDisplay] = useState<string>('');

  function connection() {
    socket.emit('findAllMessages', {},  (messages: IMessage[]) => {
      setMessages(messages);
    });

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('typing', ({name, isTyping}) => {
      if (isTyping) setTypingDisplay(`${name} is typing...`);
      else setTypingDisplay('');
    });
  }


  function join(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    socket.emit('join', { name }, () => setJoined(true));

    connection();
  }

  function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    socket.emit('createMessage', { text }, () => {
      setText('');
    });
  }

  function emitTyping(e: ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);

    socket.emit('typing', { isTyping: true });

    setTimeout(() => {
      socket.emit('typing', { isTyping: false });
    }, 2000);
  }

  return (
    <div className="chat">
      {
        joined
        &&
        <div>
          {
            messages?.length
            ?
            <ul>
              { messages.map(({name, text }, ndx) => (
                <li key={ndx}>
                  <p><b>{`[${name}]:`}</b> {text}</p>
                </li>
              ))}
            </ul>
            :
            <h4>No messages:</h4>
          }

          {
            typingDisplay && <div><b>{typingDisplay}</b></div>
          }
        </div>
      }

      {
        joined
        ?
        <form className="chat__form" onSubmit={sendMessage}>
          <input
            value={text}
            type="text"
            placeholder="message"
            className="chat__input"
            onChange={emitTyping}
          />
        </form>
        :
        <form className="chat__form" onSubmit={join}>
          <input
            value={name}
            type="text"
            placeholder="What's your name?"
            className="chat__input"
            onChange={(e) => setName(e.target.value)}
          />
        </form>
      }
    </div>
  );
}

export default App;
