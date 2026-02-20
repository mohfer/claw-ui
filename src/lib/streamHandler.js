export function createStream(url, { onTool, onChunk, onDone, onError } = {}) {
    const es = new EventSource(url)

    es.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data)
            if (data.type === 'tool' && onTool) onTool(data)
            else if (data.type === 'chunk' && onChunk) onChunk(data)
            else if (data.type === 'done' && onDone) onDone(data)
        } catch (err) {
            if (onError) onError(err)
        }
    }

    es.onerror = (err) => {
        if (onError) onError(err)
        try { es.close() } catch (e) { }
    }

    return es
}
