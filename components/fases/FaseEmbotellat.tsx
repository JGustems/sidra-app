function BlocRow({ bloc, ampolles, taps, sucres, numInici, onDelete, onUpdate }: {
  bloc: Partial<EmbotellAtBloc> & { _local?: boolean }
  ampolles: TipusAmpolla[]
  taps: TipusTap[]
  sucres: TipusSucre[]
  numInici: number
  onDelete: () => void
  onUpdate: (b: Partial<EmbotellAtBloc>) => void
}) {
  const ampolla = ampolles.find(a => a.id === bloc.ampolla_id)
  const tap = taps.find(t => t.id === bloc.tap_id)
  const sucre = sucres.find(s => s.id === bloc.sucre_id)
  const numFinal = numInici + (bloc.quantitat ?? 0) - 1
  const tag = ampolla && tap && sucre ? `${ampolla.codi}.${tap.codi}.${sucre.codi}` : '—'
  const volL = ampolla ? ((bloc.quantitat ?? 0) * ampolla.mida_cl / 100).toFixed(2) : '—'

  return (
    <div style={{
      borderBottom: `0.5px solid ${colors.bg3}`,
      padding: '8px 12px',
    }}>
      {/* Fila 1: selects */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.ampolla_id ?? ''}
          onChange={e => onUpdate({ ...bloc, ampolla_id: parseInt(e.target.value) })}
        >
          <option value="">Ampolla</option>
          {ampolles.filter(a => a.actiu).map(a => <option key={a.id} value={a.id}>{a.codi} — {a.nom} ({a.mida_cl}cl)</option>)}
        </select>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.tap_id ?? ''}
          onChange={e => onUpdate({ ...bloc, tap_id: parseInt(e.target.value) })}
        >
          <option value="">Tap</option>
          {taps.filter(t => t.actiu).map(t => <option key={t.id} value={t.id}>{t.codi} — {t.nom}</option>)}
        </select>
        <select
          style={{ ...S.fieldSelect, flex: 1, fontSize: '11px' }}
          value={bloc.sucre_id ?? ''}
          onChange={e => onUpdate({ ...bloc, sucre_id: parseInt(e.target.value) })}
        >
          <option value="">Sucre</option>
          {sucres.filter(s => s.actiu).map(s => <option key={s.id} value={s.id}>{s.codi} — {s.nom}</option>)}
        </select>
        <button onClick={onDelete} style={{ ...S.btnDel, fontSize: '12px', flexShrink: 0 }}>✕</button>
      </div>
      {/* Fila 2: quantitat + info calculada */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          style={{ ...S.fieldInput, width: '60px', flex: 'none' }}
          type="number" min="1"
          value={bloc.quantitat ?? ''}
          placeholder="qty"
          onChange={e => onUpdate({ ...bloc, quantitat: parseInt(e.target.value) || 0 })}
        />
        <span style={{ fontSize: '10px', color: colors.text3 }}>ampolles</span>
        <span style={{ fontSize: '10px', color: colors.text2, marginLeft: '8px' }}>
          {bloc.quantitat ? `${String(numInici).padStart(3,'0')} → ${String(numFinal).padStart(3,'0')}` : '—'}
        </span>
        <span style={{ fontSize: '10px', color: colors.teal, marginLeft: 'auto', fontWeight: '500' }}>
          {tag !== '—' ? tag : ''} {bloc.quantitat && ampolla ? `· ${volL} l` : ''}
        </span>
      </div>
    </div>
  )
}
