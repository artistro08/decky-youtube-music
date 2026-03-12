const manifest = {"name":"YouTube Music"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaMusic (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"},"child":[]}]})(props);
}

let authListeners = [];
const addAuthListener = (fn) => {
    authListeners.push(fn);
    return () => { authListeners = authListeners.filter((l) => l !== fn); };
};
const notifyAuthRequired = () => authListeners.forEach((l) => l());

const BASE_URL = 'http://127.0.0.1:26538/api/v1';
const TOKEN_KEY = 'ytmusic_api_token';
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const headers = () => {
    const token = getToken();
    const h = { 'Content-Type': 'application/json' };
    if (token)
        h['Authorization'] = `Bearer ${token}`;
    return h;
};
// Returns true on success, false on 401 (triggers auth prompt), throws on other errors
const post = async (path, body) => {
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: headers(),
            body: body ? JSON.stringify(body) : undefined,
        });
        if (res.status === 401) {
            notifyAuthRequired();
            return false;
        }
        return true;
    }
    catch {
        return true; // network error, not auth error
    }
};
const get = async (path) => {
    try {
        const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
        if (res.status === 401) {
            notifyAuthRequired();
            return null;
        }
        if (res.status === 204)
            return null;
        return res.json();
    }
    catch {
        return null;
    }
};
const del = async (path) => {
    try {
        await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() });
    }
    catch {
        // silent
    }
};
const patch = async (path, body) => {
    try {
        await fetch(`${BASE_URL}${path}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(body),
        });
    }
    catch {
        // silent
    }
};
const togglePlay = () => post('/toggle-play');
const next = () => post('/next');
const previous = () => post('/previous');
const seekTo = (seconds) => post('/seek-to', { seconds });
const setVolume = (volume) => post('/volume', { volume });
const toggleMute = () => post('/toggle-mute');
const shuffle = () => post('/shuffle');
const switchRepeat = (iteration) => post('/switch-repeat', { iteration });
const like = () => post('/like');
const dislike = () => post('/dislike');
// Queue
const getQueue = () => get('/queue');
const removeFromQueue = (index) => del(`/queue/${index}`);
const clearQueue = () => del('/queue');
const setQueueIndex = (index) => patch('/queue', { index });

const WS_URL = 'ws://127.0.0.1:26538/api/v1/ws';
const RECONNECT_DELAY_MS = 5000;
let socket = null;
let reconnectTimer = null;
let listeners = [];
let destroyed = false;
const addStateListener = (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
};
const notify = (state) => listeners.forEach((l) => l(state));
const buildUrl = () => {
    const token = getToken();
    return token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
};
const connect = () => {
    if (destroyed)
        return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
        return;
    socket = new WebSocket(buildUrl());
    socket.onopen = () => {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        notify({ connected: true, authRequired: false });
    };
    socket.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            handleMessage(msg);
        }
        catch {
            // ignore malformed messages
        }
    };
    socket.onclose = () => {
        notify({ connected: false });
        if (!destroyed) {
            reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
    };
    socket.onerror = () => {
        socket?.close();
    };
};
const disconnect = () => {
    destroyed = true;
    if (reconnectTimer)
        clearTimeout(reconnectTimer);
    socket?.close();
    socket = null;
};
const resetAndConnect = () => {
    destroyed = false;
    connect();
};
const handleMessage = (msg) => {
    const type = msg.type;
    switch (type) {
        case 'PLAYER_INFO':
            notify({
                song: msg.song,
                isPlaying: msg.isPlaying ?? false,
                muted: msg.muted ?? false,
                position: msg.position ?? 0,
                volume: msg.volume ?? 100,
                repeat: msg.repeat ?? 'NONE',
                shuffle: msg.shuffle ?? false,
                connected: true,
                authRequired: false,
            });
            break;
        case 'VIDEO_CHANGED':
            notify({ song: msg.song, position: 0 });
            break;
        case 'PLAYER_STATE_CHANGED':
            notify({ isPlaying: msg.isPlaying ?? false, position: msg.position ?? 0 });
            break;
        case 'POSITION_CHANGED':
            notify({ position: msg.position ?? 0 });
            break;
        case 'VOLUME_CHANGED':
            notify({ volume: msg.volume ?? 100, muted: msg.muted ?? false });
            break;
        case 'REPEAT_CHANGED':
            notify({ repeat: msg.repeat ?? 'NONE' });
            break;
        case 'SHUFFLE_CHANGED':
            notify({ shuffle: msg.shuffle ?? false });
            break;
    }
};

const defaultState = {
    song: undefined,
    isPlaying: false,
    muted: false,
    position: 0,
    volume: 100,
    repeat: 'NONE',
    shuffle: false,
    connected: false,
    authRequired: false,
};
const reducer = (state, action) => {
    if (action.type === 'UPDATE')
        return { ...state, ...action.payload };
    return state;
};
const PlayerContext = SP_REACT.createContext(defaultState);
const PlayerProvider = ({ children }) => {
    const [state, dispatch] = SP_REACT.useReducer(reducer, defaultState);
    SP_REACT.useEffect(() => {
        resetAndConnect();
        const removeState = addStateListener((partial) => dispatch({ type: 'UPDATE', payload: partial }));
        const removeAuth = addAuthListener(() => dispatch({ type: 'UPDATE', payload: { authRequired: true } }));
        return () => {
            removeState();
            removeAuth();
            disconnect();
        };
    }, []);
    return SP_JSX.jsx(PlayerContext.Provider, { value: state, children: children });
};
const usePlayer = () => SP_REACT.useContext(PlayerContext);

const Section = ({ title, noPull, children }) => (SP_JSX.jsxs("div", { style: noPull ? undefined : { margin: '0 -10px' }, children: [title && (SP_JSX.jsx("div", { style: {
                padding: '12px 10px 4px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: 'var(--gpSystemLighterGrey)',
                letterSpacing: '0.04em',
            }, children: title })), children] }));

const NotConnectedView = () => (SP_JSX.jsx(Section, { title: "YouTube Music", children: SP_JSX.jsxs("div", { style: { textAlign: 'center', padding: '16px', color: 'var(--gpSystemLighterGrey)' }, children: [SP_JSX.jsx("div", { style: { fontSize: '32px', marginBottom: '8px' }, children: "\uD83C\uDFB5" }), SP_JSX.jsx("div", { style: { fontWeight: 'bold', marginBottom: '8px' }, children: "Not Connected" }), SP_JSX.jsxs("div", { style: { fontSize: '12px', lineHeight: '1.4' }, children: ["Open YouTube Music and enable the ", SP_JSX.jsx("strong", { children: "API Server" }), " plugin in its settings. The plugin will connect automatically."] })] }) }));

const AuthTokenView = () => {
    const [token, setTokenInput] = SP_REACT.useState('');
    const handleSave = () => {
        if (!token.trim())
            return;
        setToken(token.trim());
        disconnect();
        setTimeout(resetAndConnect, 100);
    };
    return (SP_JSX.jsxs(Section, { title: "Authentication Required", children: [SP_JSX.jsx("div", { style: { padding: '8px 16px', fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }, children: "The YouTube Music API server requires a token. Find it in the API Server plugin settings." }), SP_JSX.jsx(DFL.TextField, { label: "API Token", value: token, onChange: (e) => setTokenInput(e.target.value) }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: handleSave, disabled: !token.trim(), children: "Save & Connect" })] }));
};

const REPEAT_LABELS = {
    NONE: 'Repeat: Off',
    ALL: 'Repeat: All',
    ONE: 'Repeat: One',
};
const REPEAT_NEXT = { NONE: 1, ALL: 1, ONE: 1 };
const rowBtnFirst = {
    marginLeft: '0px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '0',
    flex: 1,
};
const rowBtn = {
    marginLeft: '5px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '0',
    flex: 1,
};
// Wraps a SliderField in a 12px-padded container and removes Decky's
// hardcoded min-width (270px) by finding the offending element at mount.
const PaddedSlider = (props) => {
    const ref = SP_REACT.useRef(null);
    SP_REACT.useEffect(() => {
        if (!ref.current)
            return;
        ref.current.querySelectorAll('*').forEach((el) => {
            if (parseFloat(window.getComputedStyle(el).minWidth) >= 270)
                el.style.minWidth = '0';
        });
    }, []);
    return (SP_JSX.jsx("div", { ref: ref, style: { padding: '0 10px' }, children: SP_JSX.jsx(DFL.SliderField, { ...props }) }));
};
const PlayerView = () => {
    const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position } = usePlayer();
    const albumArt = song?.albumArt;
    const title = song?.title ?? 'Nothing playing';
    const artist = song?.artist ?? '';
    const duration = song?.songDuration ?? 0;
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [albumArt && (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { display: 'flex', justifyContent: 'center', padding: '8px 0' }, children: SP_JSX.jsx("img", { src: albumArt, alt: "Album art", style: { width: '100%', maxWidth: '180px', borderRadius: '8px' } }) }) })), SP_JSX.jsxs(Section, { children: [SP_JSX.jsxs("div", { style: { textAlign: 'center', padding: '8px 0' }, children: [SP_JSX.jsx("div", { style: { fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }, children: artist }))] }), duration > 0 && (SP_JSX.jsx(PaddedSlider, { label: "", value: position, min: 0, max: duration, step: 1, onChange: (val) => { void seekTo(val); }, showValue: false }))] }), SP_JSX.jsx(Section, { title: "Controls", noPull: true, children: DFL.DialogButton ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void previous(); }, children: "\u23EE" }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void togglePlay(); }, children: isPlaying ? '⏸' : '▶' }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void next(); }, children: "\u23ED" })] }), SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', marginTop: '4px', marginBottom: '4px' }, "flow-children": "horizontal", children: [SP_JSX.jsx(DFL.DialogButton, { style: rowBtnFirst, onClick: () => { void like(); }, children: "\uD83D\uDC4D Like" }), SP_JSX.jsx(DFL.DialogButton, { style: rowBtn, onClick: () => { void dislike(); }, children: "\uD83D\uDC4E Dislike" })] })] })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void previous(); }, children: "\u23EE Previous" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void togglePlay(); }, children: isPlaying ? '⏸ Pause' : '▶ Play' }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void next(); }, children: "\u23ED Next" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void like(); }, children: "\uD83D\uDC4D Like" }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void dislike(); }, children: "\uD83D\uDC4E Dislike" })] })) }), SP_JSX.jsxs(Section, { title: "Volume", children: [SP_JSX.jsx(PaddedSlider, { label: muted ? 'Muted' : `${Math.round(volume)}%`, value: muted ? 0 : volume, min: 0, max: 100, step: 1, onChange: (val) => { void setVolume(val); }, showValue: false }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void toggleMute(); }, children: muted ? '🔇 Unmute' : '🔊 Mute' })] }), SP_JSX.jsxs(Section, { title: "Playback", children: [SP_JSX.jsx(DFL.ToggleField, { label: "Shuffle", checked: isShuffled, onChange: () => { void shuffle(); } }), SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }, children: REPEAT_LABELS[repeat] ?? 'Repeat: Off' })] })] }));
};

const getRenderer = (item) => item.playlistPanelVideoRenderer ??
    item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;
const QueueView = () => {
    const [queue, setQueue] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const loadQueue = async (silent = false) => {
        if (!silent)
            setLoading(true);
        const data = await getQueue();
        setQueue(data?.items ?? []);
        if (!silent)
            setLoading(false);
    };
    SP_REACT.useEffect(() => { void loadQueue(); }, []);
    const handleJump = async (index) => {
        await setQueueIndex(index);
        void loadQueue(true);
    };
    const handleRemove = async (index) => {
        await removeFromQueue(index);
        void loadQueue(true);
    };
    const handleClear = async () => {
        await clearQueue();
        setQueue([]);
    };
    if (loading) {
        return (SP_JSX.jsx(Section, { children: SP_JSX.jsx("div", { style: { padding: '16px 10px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Loading queue..." }) }));
    }
    if (queue.length === 0) {
        return (SP_JSX.jsx(Section, { title: "Queue", children: SP_JSX.jsx("div", { style: { padding: '8px 10px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }, children: "Queue is empty" }) }));
    }
    return (SP_JSX.jsxs(Section, { title: "Queue", children: [SP_JSX.jsx(DFL.ButtonItem, { onClick: () => { void handleClear(); }, children: "Clear Queue" }), queue.map((item, index) => {
                const r = getRenderer(item);
                const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
                const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
                const isSelected = r?.selected ?? false;
                if (DFL.DialogButton) {
                    return (SP_JSX.jsxs(DFL.Focusable, { style: { display: 'flex', alignItems: 'center', marginTop: '2px', marginBottom: '2px' }, "flow-children": "horizontal", children: [SP_JSX.jsxs(DFL.DialogButton, { style: {
                                    flex: 1,
                                    textAlign: 'left',
                                    height: 'auto',
                                    minHeight: '40px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }, onClick: () => { void handleJump(index); }, children: [SP_JSX.jsx("div", { style: { fontWeight: isSelected ? 'bold' : 'normal', fontSize: '13px' }, children: title }), artist && (SP_JSX.jsx("div", { style: { fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }, children: artist }))] }), SP_JSX.jsx(DFL.DialogButton, { onClick: () => { void handleRemove(index); }, style: {
                                    width: '28px',
                                    height: '28px',
                                    minWidth: '0',
                                    padding: '0',
                                    marginLeft: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }, children: "\u2715" })] }, index));
                }
                // Fallback when DialogButton unavailable
                return (SP_JSX.jsx(DFL.Field, { label: SP_JSX.jsx("span", { style: { fontWeight: isSelected ? 'bold' : 'normal' }, children: title }), description: artist || undefined, onActivate: () => { void handleJump(index); }, onClick: () => { void handleJump(index); }, highlightOnFocus: true, focusable: true, bottomSeparator: "none" }, index));
            })] }));
};

const TabsContainer = () => {
    const [activeTab, setActiveTab] = SP_REACT.useState('player');
    const containerRef = SP_REACT.useRef(null);
    const [height, setHeight] = SP_REACT.useState(500);
    // Height measurement — run once on mount.
    SP_REACT.useEffect(() => {
        if (!containerRef.current)
            return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let el = containerRef.current.parentElement;
        while (el && el !== document.documentElement) {
            const style = window.getComputedStyle(el);
            const oy = style.overflowY;
            if (oy === 'scroll' || oy === 'auto' || oy === 'overlay') {
                const elRect = el.getBoundingClientRect();
                setHeight(elRect.bottom - containerRect.top);
                return;
            }
            el = el.parentElement;
        }
        setHeight(window.innerHeight - containerRect.top);
    }, []);
    // Zero the Decky Tabs content scroll container padding.
    // The _TabContentsScroll element has 2.8vw left/right padding injected by
    // Decky's CSS. It renders outside our containerRef DOM subtree (portal), so
    // we query the document directly using its stable class name fragment.
    // Runs on mount and on every tab switch in case the element is recreated.
    SP_REACT.useEffect(() => {
        document.querySelectorAll('[class*="TabContentsScroll"]').forEach((el) => {
            el.style.paddingLeft = '0';
            el.style.paddingRight = '0';
        });
    }, [activeTab]);
    return (SP_JSX.jsx("div", { ref: containerRef, style: { height }, children: SP_JSX.jsx(DFL.Tabs, { activeTab: activeTab, onShowTab: (tabID) => setActiveTab(tabID), tabs: [
                { id: 'player', title: 'Player', content: SP_JSX.jsx(PlayerView, {}) },
                { id: 'queue', title: 'Queue', content: SP_JSX.jsx(QueueView, {}) },
            ] }) }));
};
const PluginContent = () => {
    const { connected, authRequired } = usePlayer();
    const [activeTab, setActiveTab] = SP_REACT.useState('player');
    if (!connected)
        return SP_JSX.jsx(NotConnectedView, {});
    if (authRequired)
        return SP_JSX.jsx(AuthTokenView, {});
    if (!DFL.Tabs) {
        return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(Section, { children: ['player', 'queue'].map((id) => (SP_JSX.jsx(DFL.ButtonItem, { onClick: () => setActiveTab(id), children: activeTab === id
                            ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                            : id.charAt(0).toUpperCase() + id.slice(1) }, id))) }), activeTab === 'player' && SP_JSX.jsx(PlayerView, {}), activeTab === 'queue' && SP_JSX.jsx(QueueView, {})] }));
    }
    return SP_JSX.jsx(TabsContainer, {});
};
const Content = () => (SP_JSX.jsx(PlayerProvider, { children: SP_JSX.jsx(PluginContent, {}) }));
var index = definePlugin(() => ({
    name: 'YouTube Music',
    titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "YouTube Music" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaMusic, {}),
    onDismount() { },
}));

export { index as default };
//# sourceMappingURL=index.js.map
