// ============================================================
// TEMA GLOBAL — canvia aquí i s'aplica a tota la web
// ============================================================

export const colors = {
  // Fons
  bg:       '#141412',
  bg2:      '#1a1917',
  bg3:      '#222019',
  bgHead:   '#0e0d0c',

  // Bordes
  border:   '#252422',
  border2:  '#2e2c2a',

  // Text
  text:     '#c8c4be',
  text2:    '#7a7672',
  text3:    '#4a4846',
  textHi:   '#f0ede8',

  // Accent ambre (accions principals)
  amber:    '#BA7517',
  amberHi:  '#EF9F27',
  amberBg:  '#2a1800',

  // Accent verd (desat / ok)
  teal:     '#1D9E75',
  tealBg:   '#0a2318',

  // Perill
  danger:   '#E24B4A',
}

export const S = {
  // Cards
  card:        { background: colors.bg2, border: `0.5px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardEditing: { background: colors.bg2, border: `0.5px solid ${colors.amber}`, borderRadius: '8px', overflow: 'hidden' as const, marginBottom: '8px' },
  cardHead:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderBottom: `0.5px solid ${colors.border}`, background: colors.bg },
  cardFoot:    { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, padding: '7px 12px', borderTop: `0.5px solid ${colors.border}`, background: colors.bg },
  cardId:      { fontSize: '11px', fontWeight: '500' as const, color: colors.text, background: colors.border, padding: '2px 8px', borderRadius: '4px' },

  // Fields
  fieldRow:    { display: 'flex' as const, alignItems: 'center' as const, padding: '7px 12px', borderBottom: `0.5px solid ${colors.bg3}` },
  fieldLabel:  { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: colors.text3, width: '120px', flexShrink: 0 },
  fieldValue:  { fontSize: '12px', color: colors.text, fontWeight: '500' as const },
  fieldEmpty:  { fontSize: '11px', color: colors.border2, fontStyle: 'italic' as const },
  fieldInput:  { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: 'transparent', border: 'none', borderBottom: `1px solid ${colors.border2}`, color: colors.textHi, outline: 'none', flex: 1, padding: '1px 4px' },
  fieldSelect: { fontFamily: 'DM Mono, monospace', fontSize: '12px', background: colors.bg2, border: 'none', borderBottom: `1px solid ${colors.border2}`, color: colors.textHi, outline: 'none', flex: 1, padding: '1px 4px' },
  autoField:   { fontSize: '11px', color: colors.text3, fontStyle: 'italic' as const },

  // Badges
  badgeSaved:  { fontSize: '9px', background: colors.tealBg, color: colors.teal, padding: '2px 8px', borderRadius: '10px' },
  badgeEdit:   { fontSize: '9px', background: colors.amberBg, color: colors.amberHi, padding: '2px 8px', borderRadius: '10px' },
  lotBadge:    { fontSize: '10px', background: colors.amberBg, color: colors.amberHi, padding: '2px 8px', borderRadius: '4px', fontWeight: '500' as const },

  // Buttons
  btnEdit:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: `0.5px solid ${colors.border2}`, background: 'none', color: colors.text2, cursor: 'pointer' },
  btnSave:     { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 14px', borderRadius: '5px', border: 'none', background: colors.amber, color: '#fff', cursor: 'pointer' },
  btnCancel:   { fontFamily: 'DM Mono, monospace', fontSize: '10px', padding: '3px 10px', borderRadius: '5px', border: `0.5px solid ${colors.border}`, background: 'none', color: colors.text3, cursor: 'pointer' },
  btnDel:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', border: 'none', background: 'none', color: colors.text3, cursor: 'pointer' },
  btnAdd:      { fontFamily: 'DM Mono, monospace', fontSize: '10px', color: colors.amber, background: 'none', border: 'none', cursor: 'pointer' },

  // Balance
  balOk:       { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: colors.tealBg, color: colors.teal, margin: '0 12px 8px' },
  balWarn:     { fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: colors.amberBg, color: colors.amberHi, margin: '0 12px 8px' },

  // Section
  sectionHead: { fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: colors.text3, marginBottom: '8px' },
}
