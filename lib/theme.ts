// ============================================================
// TEMA GLOBAL — canvia aquí i s'aplica a tota la web
// GitHub Dark Mode inspired
// ============================================================

export const colors = {
  // Fons (GitHub dark palette)
  bg:       '#0d1117',
  bg2:      '#161b22',
  bg3:      '#21262d',
  bgHead:   '#0d1117',

  // Bordes
  border:   '#30363d',
  border2:  '#444c56',

  // Text (millor contrast)
  text:     '#e6edf3',
  text2:    '#8b949e',
  text3:    '#6e7681',
  textHi:   '#ffffff',

  // Accent blau (GitHub primary)
  amber:    '#58a6ff',
  amberHi:  '#79c0ff',
  amberBg:  '#0d2d4e',

  // Accent verd (GitHub success)
  teal:     '#3fb950',
  tealBg:   '#0d3b23',

  // Perill (GitHub danger)
  danger:   '#f85149',
}

export const S = {
  // Cards
  card:        { background: colors.bg2, border: `1px solid ${colors.border}`, borderRadius: '6px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: colors.bg2, border: `1px solid ${colors.amber}`, borderRadius: '6px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, background: colors.bg3 },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: colors.bg3 },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: colors.text2, background: colors.bg3, padding: '4px 8px', borderRadius: '4px' },

  // Fields
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '12px 16px', borderBottom: `1px solid ${colors.border}` },
  fieldLabel:  { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: colors.text3, width: '120px', flexShrink: 0, fontWeight: '600' as const },
  fieldValue:  { fontSize: '13px', color: colors.text, fontWeight: '400' as const },
  fieldEmpty:  { fontSize: '12px', color: colors.text3, fontStyle: 'italic' as const },
fieldInput: { fontFamily: 'DM Mono, monospace', fontSize: '13px', background: 'transparent', border: 'none', borderBottom: `1px solid ${colors.border2}`, borderRadius: '0', color: colors.textHi, outline: 'none', padding: '1px 4px', width: '100%', boxSizing: 'border-box' as const },  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '13px', background: colors.bg2, border: `1px solid ${colors.border2}`, borderRadius: '6px', color: colors.textHi, outline: 'none', padding: '8px 12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  autoField:   { fontSize: '11px', color: colors.text3, fontStyle: 'italic' as const },

  // Badges
  badgeSaved:  { fontSize: '11px', background: colors.tealBg, color: colors.teal, padding: '4px 12px', borderRadius: '12px', fontWeight: '500' as const, border: `1px solid ${colors.teal}33` },
  badgeEdit:   { fontSize: '11px', background: colors.amberBg, color: colors.amberHi, padding: '4px 12px', borderRadius: '12px', fontWeight: '500' as const, border: `1px solid ${colors.amber}33` },
  lotBadge:    { fontSize: '11px', background: colors.amberBg, color: colors.amberHi, padding: '4px 10px', borderRadius: '4px', fontWeight: '600' as const, border: `1px solid ${colors.amber}33` },

  // Buttons
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${colors.border2}`, background: 'transparent', color: colors.text, cursor: 'pointer', fontWeight: '500' as const, transition: 'all 0.2s', ':hover': { borderColor: colors.text2, background: colors.bg3 } },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '6px 16px', borderRadius: '6px', border: 'none', background: colors.teal, color: '#fff', cursor: 'pointer', fontWeight: '600' as const, transition: 'all 0.2s', ':hover': { background: '#2ea043' } },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '11px', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${colors.border2}`, background: 'transparent', color: colors.text2, cursor: 'pointer', fontWeight: '500' as const, transition: 'all 0.2s', ':hover': { borderColor: colors.text3, background: colors.bg3 } },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '11px', border: 'none', background: 'none', color: colors.danger, cursor: 'pointer', fontWeight: '500' as const, transition: 'color 0.2s', ':hover': { color: '#f97583' } },
  btnAdd:      { fontFamily: 'DM Mono, monospace', fontSize: '11px', color: colors.amber, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' as const, transition: 'color 0.2s', ':hover': { color: colors.amberHi } },

  // Balance
  balOk:       { fontSize: '12px', padding: '8px 12px', borderRadius: '6px', background: colors.tealBg, color: colors.teal, margin: '0 16px 8px', border: `1px solid ${colors.teal}33`, fontWeight: '500' as const },
  balWarn:     { fontSize: '12px', padding: '8px 12px', borderRadius: '6px', background: colors.amberBg, color: colors.amberHi, margin: '0 16px 8px', border: `1px solid ${colors.amber}33`, fontWeight: '500' as const },

  // Section
  sectionHead: { fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: colors.text2, marginBottom: '12px', fontWeight: '600' as const },
}
