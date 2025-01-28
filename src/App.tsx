import { useState } from 'react'
import './App.css'
import { generateName, synthesizeSpeech } from './services/api'

function App() {
  const [name, setName] = useState('')
  const [source, setSource] = useState('')
  const [generatedNames, setGeneratedNames] = useState<Array<{
    name: string
    explanation: {
      characters: string[]
      meaning: string
      origin: string
    }
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!source) {
      alert('请选择花名来源');
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await generateName(name, source);
      setGeneratedNames(results);
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }

  const handlePlayName = async (text: string) => {
    try {
      const audioData = await synthesizeSpeech(text);
      const blob = new Blob([audioData], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : '播放失败，请稍后重试');
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>阿里花名生成器</h1>
        <p>基于智谱AI，为您生成独特的阿里花名</p>
      </header>

      <main className="main-content">
        <section className="input-section">
          <div className="input-group">
            <input
              type="text"
              placeholder="请输入您的真实姓名（选填）"
              value={name}
              onChange={(e) => {
                setName(e.target.value)}
              }
            />
          </div>
          <div className="input-group">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">请选择花名来源</option>
              <option value="literature">文献典籍</option>
              <option value="poetry">诗词歌赋</option>
              <option value="movie">影视剧</option>
            </select>
          </div>
          <button 
            className="generate-btn" 
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? '生成中...' : '生成花名'}
          </button>
        </section>

        <section className="results-section">
          {generatedNames.map((item, index) => (
            <div key={index} className="name-card">
              <h2>
                {item.name}
                <button 
                  onClick={() => handlePlayName(item.name)}
                  className="play-btn"
                  title="播放发音"
                >
                  🔊
                </button>
              </h2>
              <div className="explanation">
                <h3>单字解释</h3>
                <p>{item.explanation.characters.join('、')}</p>
                <h3>整体含义</h3>
                <p>{item.explanation.meaning}</p>
                <h3>典故来源</h3>
                <p>{item.explanation.origin}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App
