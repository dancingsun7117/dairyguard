import json
from sqlalchemy import create_engine, text
from config import DB_URL

engine = create_engine(DB_URL, connect_args={'check_same_thread': False} if DB_URL.startswith('sqlite') else {}, pool_pre_ping=True)
IS_PG = engine.dialect.name == 'postgresql'
PK = 'SERIAL PRIMARY KEY' if IS_PG else 'INTEGER PRIMARY KEY AUTOINCREMENT'


def init_db():
    with engine.begin() as c:
        for q in [
            f'CREATE TABLE IF NOT EXISTS uploads(id {PK}, filename TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, active INTEGER DEFAULT 1, rows_count INTEGER, metadata_json TEXT)',
            f'CREATE TABLE IF NOT EXISTS transactions(id {PK}, upload_id INTEGER, payload_json TEXT)',
            f'CREATE TABLE IF NOT EXISTS analysis_results(id {PK}, upload_id INTEGER, kind TEXT, payload_json TEXT)',
            f'CREATE TABLE IF NOT EXISTS users(id {PK}, identifier TEXT UNIQUE, role TEXT, name TEXT, district TEXT, collector_id TEXT, active INTEGER DEFAULT 1)',
            f'CREATE TABLE IF NOT EXISTS audit_logs(id {PK}, user_identifier TEXT, role TEXT, action TEXT, object_id TEXT, details_json TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)',
        ]:
            c.execute(text(q))
        if IS_PG:
            c.execute(text("INSERT INTO users(identifier,role,name,district) VALUES(:i,:r,:n,:d) ON CONFLICT (identifier) DO NOTHING"),
                      {'i': 'GOV-DEMO-001', 'r': 'government', 'n': 'Government Demo Officer', 'd': 'All'})
        else:
            c.execute(text('INSERT OR IGNORE INTO users(identifier,role,name,district) VALUES("GOV-DEMO-001","government","Government Demo Officer","All")'))


def save_run(filename, rows, metadata, transactions, results):
    with engine.begin() as c:
        c.execute(text('UPDATE uploads SET active=0'))
        if IS_PG:
            u = c.execute(text('INSERT INTO uploads(filename,active,rows_count,metadata_json) VALUES(:f,1,:n,:m) RETURNING id'),
                           {'f': filename, 'n': len(rows), 'm': json.dumps(metadata, default=str)}).scalar()
        else:
            r = c.execute(text('INSERT INTO uploads(filename,active,rows_count,metadata_json) VALUES(:f,1,:n,:m)'),
                           {'f': filename, 'n': len(rows), 'm': json.dumps(metadata, default=str)})
            u = r.lastrowid
        if transactions:
            c.execute(text('INSERT INTO transactions(upload_id,payload_json) VALUES(:u,:p)'),
                      [{'u': u, 'p': json.dumps(x, default=str)} for x in transactions])
        if results:
            c.execute(text('INSERT INTO analysis_results(upload_id,kind,payload_json) VALUES(:u,:k,:p)'),
                      [{'u': u, 'k': k, 'p': json.dumps(v, default=str)} for k, v in results.items()])
        return u


def active_rows():
    with engine.begin() as c:
        u = c.execute(text('SELECT id FROM uploads WHERE active=1 ORDER BY id DESC LIMIT 1')).scalar()
        return (u, [] if not u else [json.loads(x[0]) for x in c.execute(text('SELECT payload_json FROM transactions WHERE upload_id=:u'), {'u': u})])


def active_results():
    with engine.begin() as c:
        u = c.execute(text('SELECT id FROM uploads WHERE active=1 ORDER BY id DESC LIMIT 1')).scalar()
        return {} if not u else {k: json.loads(p) for k, p in c.execute(text('SELECT kind,payload_json FROM analysis_results WHERE upload_id=:u'), {'u': u})}


def user(identifier, role):
    with engine.begin() as c:
        return c.execute(text('SELECT identifier,role,name,district,collector_id FROM users WHERE identifier=:i AND role=:r AND active=1'),
                          {'i': identifier.upper(), 'r': role}).mappings().first()


def ensure_collector(identifier, district='Unknown'):
    with engine.begin() as c:
        if IS_PG:
            c.execute(text("INSERT INTO users(identifier,role,name,district,collector_id) VALUES(:i,'collector',:n,:d,:i) ON CONFLICT (identifier) DO NOTHING"),
                      {'i': identifier.upper(), 'n': 'Collection Centre ' + identifier.upper(), 'd': district})
        else:
            c.execute(text('INSERT OR IGNORE INTO users(identifier,role,name,district,collector_id) VALUES(:i,"collector",:n,:d,:i)'),
                      {'i': identifier.upper(), 'n': 'Collection Centre ' + identifier.upper(), 'd': district})


def audit(u, r, a, obj='', details=None):
    with engine.begin() as c:
        c.execute(text('INSERT INTO audit_logs(user_identifier,role,action,object_id,details_json) VALUES(:u,:r,:a,:o,:d)'),
                  {'u': u, 'r': r, 'a': a, 'o': obj, 'd': json.dumps(details or {}, default=str)})


def audits():
    with engine.begin() as c:
        return [dict(x) for x in c.execute(text('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100')).mappings()]
