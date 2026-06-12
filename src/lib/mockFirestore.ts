function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static fromDate(date: Date) {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static now() {
    return Timestamp.fromDate(new Date());
  }

  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
  }

  toMillis() {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }
}

const mapToSnapshot = (items: any[]) => {
  const docs = items.map(item => ({
    id: item.id || item.uid,
    exists: () => true,
    data: () => item
  }));
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: any) => void) => {
      docs.forEach(callback);
    }
  };
};

function resolveUrl(refOrQuery: any): { url: string, isSubcollection: boolean, parentId?: string, subName?: string } {
  const path = refOrQuery.path;
  const parts = path.split('/');
  if (parts.length === 1) {
    const col = parts[0];
    if (col === 'users') return { url: '/api/users', isSubcollection: false };
    if (col === 'pacientes') return { url: '/api/pacientes', isSubcollection: false };
    if (col === 'recibos') return { url: '/api/recibos', isSubcollection: false };
    if (col === 'agendamentos') return { url: '/api/agendamentos', isSubcollection: false };
    if (col === 'guias') return { url: '/api/guias', isSubcollection: false };
    if (col === 'invites') return { url: '/api/invites', isSubcollection: false };
  } else if (parts.length === 3) {
    const [parent, parentId, sub] = parts;
    if (parent === 'pacientes') {
      return {
        url: `/api/pacientes/${parentId}/${sub}`,
        isSubcollection: true,
        parentId,
        subName: sub
      };
    }
  }
  return { url: `/api/${path}`, isSubcollection: false };
}

export function collection(dbOrRef: any, path: string, ...segments: string[]) {
  let fullPath = path;
  if (dbOrRef && dbOrRef.type === 'collection') {
    fullPath = dbOrRef.path + '/' + path;
  }
  if (segments.length > 0) {
    fullPath = [fullPath, ...segments].join('/');
  }
  return { type: 'collection', path: fullPath };
}

export function doc(dbOrRef: any, pathOrId?: string, ...more: string[]) {
  if (dbOrRef && dbOrRef.type === 'collection') {
    const id = pathOrId || uuidv4();
    return { type: 'document', path: dbOrRef.path, id };
  }
  const path = pathOrId || '';
  const id = more[0] || '';
  return { type: 'document', path, id };
}

export function query(ref: any, ...constraints: any[]) {
  return { type: 'query', ref, constraints };
}

export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(n: number) {
  return { type: 'limit', n };
}

export function collectionGroup(db: any, collectionId: string) {
  return { type: 'collection', path: collectionId };
}

export async function getDocs(queryOrRef: any) {
  const ref = queryOrRef.type === 'query' ? queryOrRef.ref : queryOrRef;
  const constraints = queryOrRef.type === 'query' ? queryOrRef.constraints : [];
  
  const { url } = resolveUrl(ref);
  const params = new URLSearchParams();
  
  for (const c of constraints) {
    if (c.type === 'where') {
      if (c.field === 'userId' || c.field === 'email' || c.field === 'tenantId' || c.field === 'slug') {
        params.append(c.field === 'tenantId' ? 'userId' : c.field, c.value);
      }
    }
  }

  const queryString = params.toString();
  const finalUrl = queryString ? `${url}?${queryString}` : url;
  
  const res = await fetch(finalUrl);
  if (!res.ok) throw new Error(`HTTP error ${res.status} on GET ${finalUrl}`);
  const data = await res.json();
  const items = Array.isArray(data) ? data : [data];

  let filtered = items;
  for (const c of constraints) {
    if (c.type === 'where') {
      if (c.field !== 'userId' && c.field !== 'email' && c.field !== 'tenantId' && c.field !== 'slug') {
        filtered = filtered.filter((item: any) => {
          const val = item[c.field];
          if (c.op === '==') return val === c.value;
          if (c.op === '!=') return val !== c.value;
          return true;
        });
      }
    }
  }

  return mapToSnapshot(filtered);
}

export async function getDoc(docRef: any) {
  const parts = docRef.path.split('/');
  let url = '';
  if (parts.length === 1) {
    const col = parts[0];
    if (col === 'users') {
      url = `/api/users/${docRef.id}`;
    } else {
      url = `/api/${col}/${docRef.id}`;
    }
  } else if (parts.length === 3) {
    const [parent, parentId, sub] = parts;
    url = `/api/pacientes/${parentId}/${sub}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        return {
          id: docRef.id,
          exists: () => false,
          data: () => null
        };
      }
      throw new Error(`HTTP error ${res.status} on GET ${url}`);
    }
    const data = await res.json();
    
    if (parts.length === 3) {
      const item = data.find((x: any) => x.id === docRef.id);
      return {
        id: docRef.id,
        exists: () => !!item,
        data: () => item || null
      };
    }

    return {
      id: docRef.id,
      exists: () => true,
      data: () => data
    };
  } catch (e) {
    return {
      id: docRef.id,
      exists: () => false,
      data: () => null
    };
  }
}

export const getDocFromServer = getDoc;

export async function setDoc(docRef: any, data: any, options?: any) {
  const parts = docRef.path.split('/');
  let url = '';
  let body: any = { ...data };
  
  if (parts.length === 1) {
    const col = parts[0];
    if (col === 'users') {
      url = `/api/users`;
      body.uid = docRef.id;
    } else {
      url = `/api/${col}`;
      body.id = docRef.id;
    }
  } else if (parts.length === 3) {
    const [parent, parentId, sub] = parts;
    url = `/api/pacientes/${parentId}/${sub}`;
    body.id = docRef.id;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} on POST ${url}`);
  return await res.json();
}

export async function updateDoc(docRef: any, data: any) {
  return await setDoc(docRef, data);
}

export async function addDoc(collectionRef: any, data: any) {
  const parts = collectionRef.path.split('/');
  let url = '';
  if (parts.length === 1) {
    url = `/api/${parts[0]}`;
  } else if (parts.length === 3) {
    const [parent, parentId, sub] = parts;
    url = `/api/pacientes/${parentId}/${sub}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} on POST ${url}`);
  const created = await res.json();
  return {
    id: created.id,
    path: `${collectionRef.path}/${created.id}`,
    get: () => created
  };
}

export async function deleteDoc(docRef: any) {
  const parts = docRef.path.split('/');
  let url = '';
  if (parts.length === 1) {
    url = `/api/${parts[0]}/${docRef.id}`;
  } else if (parts.length === 3) {
    const [parent, parentId, sub] = parts;
    url = `/api/${sub}/${docRef.id}`;
  }

  const res = await fetch(url, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} on DELETE ${url}`);
  return await res.json();
}

export function onSnapshot(queryOrRef: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) {
  let active = true;
  let lastJson = '';

  const fetchAndTrigger = async () => {
    try {
      const snap = await getDocs(queryOrRef);
      if (!active) return;
      const currentJson = JSON.stringify(snap.docs.map(d => d.data()));
      if (currentJson !== lastJson) {
        lastJson = currentJson;
        callback(snap);
      }
    } catch (e) {
      if (errorCallback) errorCallback(e);
    }
  };

  fetchAndTrigger();
  const interval = setInterval(fetchAndTrigger, 4000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export function writeBatch(db: any) {
  const ops: any[] = [];
  return {
    set: (docRef: any, data: any) => {
      ops.push({ type: 'set', docRef, data });
    },
    update: (docRef: any, data: any) => {
      ops.push({ type: 'update', docRef, data });
    },
    delete: (docRef: any) => {
      ops.push({ type: 'delete', docRef });
    },
    commit: async () => {
      for (const op of ops) {
        if (op.type === 'set' || op.type === 'update') {
          await setDoc(op.docRef, op.data);
        } else if (op.type === 'delete') {
          await deleteDoc(op.docRef);
        }
      }
    }
  };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export function initializeFirestore(app: any, settings?: any, databaseId?: string) {
  return { type: 'db' };
}

export function getFirestore(app?: any, databaseId?: string) {
  return { type: 'db' };
}

export function persistentLocalCache(options?: any) {
  return { type: 'persistentLocalCache', options };
}

export function persistentMultipleTabManager() {
  return { type: 'persistentMultipleTabManager' };
}

export function increment(n: number) {
  return { type: 'increment', value: n };
}


