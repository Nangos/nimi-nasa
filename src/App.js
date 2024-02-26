import './App.css';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import sampleData from './sample.json';
import dictionary from './dictionary.json';

function App() {
  const [data, setData] = useState(sampleData);
  const [query, setQuery] = useState(sampleData.query);

  const [kWan, setKWan] = useState(10);
  const [kTu, setKTu] = useState(10);
  const [kAle, setKAle] = useState(10);
  const maxKWan = 20;
  const maxKTu = 20;
  const maxKAle = 20;

  const [markdown, setMarkdown] = useState('');
  useEffect(() => {
    axios.get('./lipu.md')
      .then(response => setMarkdown(response.data))
      .catch(error => console.log(error));
  }, []);

  const getDefaultNimi = (data) => {
    try {
      if (!data.success) {
        return "pu";
      }
      return data.top_k[0][1];
    } catch (error) {
      return "pu";
    }
  }
  const [nimi, setNimi] = useState(getDefaultNimi(sampleData));
  const [noConnection, setNoConnection] = useState(false);

  const spanRef = useRef();
  const host = "http://129.105.15.197:4098"

  const queryRef = useRef();
  queryRef.current = query;
  
  // execute the following two functions whenever `query` is initialized or updated:
  useEffect(() => {
    fetch(`${host}/toki/${queryRef.current}?k1=${maxKWan}&k2=${maxKTu}&k3=${maxKAle}`)
      .then((res) => res.json())
      .then((data) => { if (data.query === queryRef.current) { setData(data); setNimi(getDefaultNimi(data)); } })
      .catch((error) => { setNoConnection(true); console.log(error); });
  }, [query]);
  useEffect(() => {
    if (spanRef.current) {
      let width = spanRef.current.offsetWidth;
      spanRef.current.previousSibling.style.width = `${width < 40? 40: width}px`;
    }
  }, [query]);

  const onQueryChange = (event) => {
    if (event.target.value.length > 25) {
      return; // too long a word!
    }
    setNoConnection(false);
    setQuery(event.target.value);
  }

  const onKWanChange = (event) => {
    if (event.target.value < 1 || event.target.value > maxKWan) {
      return;
    }
    setKWan(event.target.value);
  }
  const onKTuChange = (event) => {
    if (event.target.value < 1 || event.target.value > maxKTu) {
      return;
    }
    setKTu(event.target.value);
  }
  const onKAleChange = (event) => {
    if (event.target.value < 1 || event.target.value > maxKAle) {
      return;
    }
    setKAle(event.target.value);
  }

  const onMouseEnterFactory = (nimi) => {
    return () => {
      setNimi(nimi);
    }
  }

  const likeFactory = (word, task_id, answer) => {
    return () => {
      axios.post(`${host}/like/${word}?task_id=${task_id}&answer=${answer}`)
        .then((res) => console.log(res))
        .catch((error) => console.log(error));
    }
  }
  const dislikeFactory = (word, task_id, answer) => {
    return () => {
      axios.post(`${host}/dislike/${word}?task_id=${task_id}&answer=${answer}`)
        .then((res) => console.log(res))
        .catch((error) => console.log(error));
    }
  }

  const renderNimiWan = (data) => {
    let top_k = data == null? []: data.top_k;
    if (top_k.length > kWan) {
      top_k = top_k.slice(0, kWan);
    }
    return (
      <div>
        <h3 className="subtitle"> kepeken nimi wan </h3>
        <table>
          <thead>
            <tr>
              <th>Top <input className='topk-box' type="number" onChange={onKWanChange} value={kWan}/> </th>
              <th>Similarity</th>
              <th colSpan="2" >Like it?</th>
            </tr>
          </thead>
          <tbody>
            {top_k.map((word, index) => {
              return (
                <tr key={index}>
                  <td className='Tp-word' onMouseEnter={onMouseEnterFactory(word[1])}>{word[1]}</td>
                  <td>{(parseFloat(word[0]) * 100).toFixed(1)}%</td>
                  <td><button className='like-button' onClick={likeFactory(query, 1, word[1])}>&#x1F44D;</button></td>
                  <td><button className='like-button' onClick={dislikeFactory(query, 1, word[1])}>&#x1F44E;</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const renderNimiTu = (data) => {
    let top_k = data == null? []: data.top_k_pairs;
    if (top_k.length > kTu) {
      top_k = top_k.slice(0, kTu);
    }
    return (
      <div>
        <h3 className="subtitle"> kepeken nimi tu </h3>
        <table>
          <thead>
            <tr>
              <th>Top <input className='topk-box' type="number" onChange={onKTuChange} value={kTu}/> </th>
              <th>Breakdown</th>
              <th>Similarity</th>
              <th colSpan="2" >Like it?</th>
            </tr>
          </thead>
          <tbody>
            {top_k.map((pair, index) => {
              let [similarity, word1, num1, word2, num2] = pair;
              similarity = (parseFloat(similarity) * 100).toFixed(1);
              num1 = parseFloat(num1);
              num2 = parseFloat(num2);
              if (num1 < num2) {
                [word1, word2] = [word2, word1];
                [num1, num2] = [num2, num1];
              }
              let word = `${word1} ${word2}`;
              return (
                <tr key={index}>
                  <td className='Tp-word'>
                    <span onMouseEnter={onMouseEnterFactory(word1)}>{word1}</span>&nbsp;
                    <span onMouseEnter={onMouseEnterFactory(word2)}>{word2}</span>
                  </td>
                  <td style={{fontSize: "small", textAlign: "left"}}>
                    <div>= {num1.toFixed(3)}&#x00D7; {word1}</div>
                    <div>+ {num2.toFixed(3)}&#x00D7; {word2}</div>
                  </td>
                  <td>{similarity}%</td>
                  <td><button className='like-button' onClick={likeFactory(query, 2, word)}>&#x1F44D;</button></td>
                  <td><button className='like-button' onClick={dislikeFactory(query, 2, word)}>&#x1F44E;</button></td>
                </tr>
              );
              })}
          </tbody>
        </table>
      </div>
    );
  }

  const renderNimiAle = (data) => {
    let top_k = data == null? []: data.composition[1];
    if (top_k.length > kAle) {
      top_k = top_k.slice(0, kAle);
    }
    return (
      <div>
        <h3 className="subtitle"> kepeken nimi ale </h3>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Top <input className='topk-box' type="number" onChange={onKAleChange} value={kAle}/> </th>
              <th>Scale</th>
              <th colSpan="2" >Like it?</th>
            </tr>
          </thead>
          <tbody>
            {top_k.map((word, index) => {
              return (
                <tr key={index}>
                  <td>{index === 0? "\u2248": "+"}</td>
                  <td className='Tp-word' onMouseEnter={onMouseEnterFactory(word[1])}>{word[1]}</td>
                  <td style={{textAlign: "left"}}> &#x00D7; ({parseFloat(word[0]).toFixed(3)}) </td>
                  <td><button className='like-button' onClick={likeFactory(query, 3, word[1])}>&#x1F44D;</button></td>
                  <td><button className='like-button' onClick={dislikeFactory(query, 3, word[1])}>&#x1F44E;</button></td>
                </tr>
              );
            }
            )}
          </tbody>
        </table>
      </div>
    );
  }

  const renderNimi = (nimi) => {
    let items = dictionary[nimi];
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50px" }}>
        <div className='Tp-word' style={{ fontSize: "x-large" }}>{nimi}</div>
        <div>
          <table style={{ marginLeft: '10px', textAlign: "left" }}>
            {Object.entries(items).map(([type, meaning]) => {
              return (
                <tr>
                  <td style={{ fontSize: "small", padding: "0 10px" }}>{type.toUpperCase()}</td>
                  <td>{meaning}</td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
    );
  }

  const renderWhenAbsent = (message) => {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50px" }}>{message}</div>
        {/* <div style={{ display: "flex", justifyContent: "center" }} >
          <span style={{ marginLeft: '0px', marginRight: '15px' }}>{renderNimiWan(null)}</span>
          <span style={{ marginLeft: '15px', marginRight: '15px' }}>{renderNimiTu(null)}</span>
          <span style={{ marginLeft: '15px', marginRight: '0px' }}>{renderNimiAle(null)}</span>
        </div> */}
      </div>
    )
  }
  const renderWhenPresent = () => {
    return (
      <div>
        {renderNimi(nimi)}
        <div style={{ display: "flex", justifyContent: "center" }} >
          <span style={{ marginLeft: '0px', marginRight: '15px' }}>{renderNimiWan(data)}</span>
          <span style={{ marginLeft: '15px', marginRight: '15px' }}>{renderNimiTu(data)}</span>
          <span style={{ marginLeft: '15px', marginRight: '0px' }}>{renderNimiAle(data)}</span>
        </div>
      </div>
    )
  }
  const renderHeader = () => {
    return (
      <header className="App-header">
        <span>How to Name</span>
        <div>
        <input ref={spanRef} className="Query-box" type="text" onChange={onQueryChange} value={query} />
        <span ref={spanRef} style={{ visibility: 'hidden', position: 'absolute' }}>{query}</span>
        </div>
        <span>in Toki Pona</span>
      </header>
    )
  }
  const renderBody = () => {
    if (query.length === 0) {
      return renderWhenAbsent("Please enter a word...");
    }
    if (data == null || data.query !== query) {
      if (noConnection) {
        return renderWhenAbsent("There seems to be no connection to the server. Sorry...");
      }
      return renderWhenAbsent("One moment, please...");
    }
    if (!data.success) {
      return renderWhenAbsent("Sorry, the server doesn't know this word...");
    }
    return renderWhenPresent();
  }
  const renderMarkdown = () => {
    return (
      <div className='md-container'>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="App">
      {renderHeader()}
      {renderBody()}
      {renderMarkdown()}
    </div>
  );
}

export default App;
