import React from 'react'
import { library } from '../trainingData.js'

export function LibraryScreen() {
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-head">
          <h3>Drill library</h3>
          <span className="subtle">Organized by training day so practice stays intentional.</span>
        </div>
        <div className="stack small-gap">
          {Object.entries(library).map(([group, items]) => (
            <div className="library-card" key={group}>
              <strong>{group}</strong>
              <div className="chip-wrap">
                {items.map((item) => (
                  <span className="chip" key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
