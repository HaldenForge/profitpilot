
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type KeywordRecord = {
  id: string
  marketplace: string
  keyword: string
  search_volume: number | null
  competition_level: string | null
  competition_score: number | null
  cost_per_click: number | null
  trend_direction: string | null
  ranking_position: number | null
  data_source: string | null
  data_status: string
  notes: string | null
  created_at: string
}

const marketplaces = [
  'Amazon',
  'eBay',
  'Etsy',
  'Shopify',
  'Google Search',
  'Google Shopping',
  'Walmart',
  'Other',
]

export default function KeywordResearch() {
  const [marketplace, setMarketplace] = useState('Amazon')
  const [keyword, setKeyword] = useState('')
  const [searchVolume, setSearchVolume] = useState('')
  const [competition, setCompetition] = useState('unknown')
  const [competitionScore, setCompetitionScore] = useState('')
  const [costPerClick, setCostPerClick] = useState('')
  const [trend, setTrend] = useState('unknown')
  const [rankingPosition, setRankingPosition] = useState('')
  const [notes, setNotes] = useState('')

  const [keywords, setKeywords] = useState<KeywordRecord[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadKeywords() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('keyword_research')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setKeywords((data || []) as KeywordRecord[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadKeywords()
  }, [])

  async function saveKeyword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const { error } = await supabase
      .from('keyword_research')
      .insert({
        marketplace,
        keyword: keyword.trim(),
        search_volume: searchVolume === '' ? null : Number(searchVolume),
        competition_level: competition,
        competition_score:
          competitionScore === '' ? null : Number(competitionScore),
        cost_per_click:
          costPerClick === '' ? null : Number(costPerClick),
        trend_direction: trend,
        ranking_position:
          rankingPosition === '' ? null : Number(rankingPosition),
        data_source: 'Customer entered',
        data_status: 'user_entered',
        notes: notes.trim() || null,
      })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Keyword saved successfully.')
      setKeyword('')
      setSearchVolume('')
      setCompetition('unknown')
      setCompetitionScore('')
      setCostPerClick('')
      setTrend('unknown')
      setRankingPosition('')
      setNotes('')
      await loadKeywords()
    }

    setSaving(false)
  }

  async function deleteKeyword(id: string) {
    if (!window.confirm('Are you sure you want to delete this keyword?')) {
      return
    }

    setError('')
    setMessage('')

    const { error } = await supabase
      .from('keyword_research')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setKeywords(current => current.filter(item => item.id !== id))
      setMessage('Keyword deleted.')
    }
  }

  const filteredKeywords = keywords.filter(item =>
    `${item.keyword} ${item.marketplace}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <section className="keyword-research">
      <div className="keyword-heading">
        <h2>Keyword Research</h2>
        <p>
          Research and organise product keywords across different marketplaces.
        </p>
      </div>

      <div className="keyword-layout">
        <form className="keyword-form" onSubmit={saveKeyword}>
          <h3>Add a keyword</h3>

          <label className="keyword-label">Target marketplace</label>
          <select
            value={marketplace}
            onChange={e => setMarketplace(e.target.value)}
          >
            {marketplaces.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <label className="keyword-label">Keyword or search phrase</label>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="e.g. handmade leather wallet"
            required
          />

          <div className="keyword-input-grid">
            <div>
              <label className="keyword-label">Monthly search volume</label>
              <input
                type="number"
                min="0"
                value={searchVolume}
                onChange={e => setSearchVolume(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            <div>
              <label className="keyword-label">Competition score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={competitionScore}
                onChange={e => setCompetitionScore(e.target.value)}
                placeholder="e.g. 65"
              />
            </div>

            <div>
              <label className="keyword-label">Cost per click</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPerClick}
                onChange={e => setCostPerClick(e.target.value)}
                placeholder="e.g. 0.45"
              />
            </div>

            <div>
              <label className="keyword-label">Current ranking position</label>
              <input
                type="number"
                min="1"
                value={rankingPosition}
                onChange={e => setRankingPosition(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          </div>

          <label className="keyword-label">Competition level</label>
          <select
            value={competition}
            onChange={e => setCompetition(e.target.value)}
          >
            <option value="unknown">Not known</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label className="keyword-label">Search trend</label>
          <select
            value={trend}
            onChange={e => setTrend(e.target.value)}
          >
            <option value="unknown">Not known</option>
            <option value="rising">Rising</option>
            <option value="stable">Stable</option>
            <option value="falling">Falling</option>
          </select>

          <label className="keyword-label">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add research notes..."
            rows={3}
          />

          <button
            className="keyword-save-button"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Keyword'}
          </button>

          <p className="keyword-disclaimer">
            Entered figures are customer-provided, not verified live marketplace
            data. Automated keyword data will be added through supported data
            providers later.
          </p>
        </form>

        <div className="keyword-saved">
          <h3>Saved Keywords</h3>

          <input
            className="keyword-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved keywords..."
          />

          {message && <p className="keyword-success">{message}</p>}
          {error && <p className="keyword-error">{error}</p>}

          {loading ? (
            <p>Loading keywords...</p>
          ) : filteredKeywords.length === 0 ? (
            <p className="keyword-empty">No saved keywords found.</p>
          ) : (
            <div className="keyword-list">
              {filteredKeywords.map(item => (
                <article className="keyword-card" key={item.id}>
                  <div className="keyword-card-top">
                    <strong>{item.keyword}</strong>
                    <span className="keyword-market-tag">
                      {item.marketplace}
                    </span>
                  </div>

                  <div className="keyword-details">
                    <span>
                      Search volume: {item.search_volume ?? 'Not available'}
                    </span>
                    <span>
                      Competition: {item.competition_level || 'Unknown'}
                    </span>
                    <span>
                      CPC: {item.cost_per_click ?? 'Not available'}
                    </span>
                    <span>
                      Trend: {item.trend_direction || 'Unknown'}
                    </span>
                    <span>
                      Ranking: {item.ranking_position ?? 'Not available'}
                    </span>
                  </div>

                  {item.notes && <p>{item.notes}</p>}

                  <div className="keyword-card-bottom">
                    <small>Customer entered data</small>
                    <button
                      type="button"
                      className="keyword-delete-button"
                      onClick={() => void deleteKeyword(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
