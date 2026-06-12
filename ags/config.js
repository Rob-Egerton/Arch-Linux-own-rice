function decodificarPortada(url) {
    if (!url) return '';

    // Caso 1: Ya es una ruta de archivo (lo más común en reproductores locales)
    if (url.startsWith('file://') || url.startsWith('/')) {
        return url.startsWith('file://') ? url : 'file://' + url;
    }

    // Caso 2: URL remota (http/https) - Vital para navegadores o Spotify
    if (url.startsWith('http')) {
        return url;
    }

    // Si llega alguna otra cosa rara (como los base64 que fallaban), lo regresamos tal cual
    return url;
}

const mpris = await Service.import('mpris')

// CAVA
const cavaVar = Variable('', {
    listen: ['bash', '-c', 'cava -p ~/.config/ags/cava.conf']
});

const crearBarras = (val) => {
    const caracteres = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    if (isNaN(val)) return ' ';
    const indice = Math.floor((val / 100) * (caracteres.length - 1));
    return caracteres[Math.max(0, Math.min(indice, caracteres.length - 1))];
};

// ====================== REPRODUCTOR ======================
const Reproductor = () => Widget.Box({
    className: 'contenedor-principal',
    spacing: 0,
    setup: self => self.poll(1000, box => {
        box.visible = !!mpris.players[0];
    }),
    children: [
        Widget.Box({
            className: 'album-art',
            widthRequest: 70,
            heightRequest: 70,
            vpack: 'center',
            hpack: 'start',
                    
            setup: self => self.poll(1000, box => {
                const p = mpris.players[0];
                if (!p) {
                    box.css = '';
                    return;
                }
                
                let processedCover = "";
                        
                // CONDICIÓN ZEN: Si es MPV, inyectamos al gatito
                if (p.name.includes("mpv")) {
                    processedCover = "/home/robert/Ares/wallpapers/cat.jpg";
                } else {
                    // Si es cualquier otro reproductor, procesamos la carátula normal
                    const coverUrl = p.cover_path || 
                                     p.track_cover_url || 
                                     p.metadata?.['mpris:artUrl'];
                    processedCover = decodificarPortada(coverUrl);
                }
                
                box.css = processedCover 
                    ? `background-image: url("${processedCover}");`
                    : '';
            }),
        }),

        Widget.Box({
            vertical: true,
            hexpand: true,
            vpack: 'center',
            spacing: 0,
            className: 'controles-derecha',
            children: [
                Widget.Button({
                    hpack: 'end',
                    vpack: 'start',
                    className: 'boton-eq',
                    // MODIFICADO: Ahora abre la app de EasyEffects directamente
                    onClicked: () => Utils.execAsync(['easyeffects']).catch(err => print(`[ERROR] ${err}`)),
                }),

                Widget.Slider({
                    className: 'barra-progreso',
                    drawValue: false,
                    on_change: ({ value }) => {
                        const p = mpris.players[0];
                        if (p && p.length > 0) p.position = value * p.length;
                    },
                    setup: self => self.poll(1000, slider => {
                        const p = mpris.players[0];
                        if (p && p.length > 0 && !slider.dragging) {
                            slider.value = p.position / p.length;
                        }
                    }),
                }),

                Widget.Box({
                    hpack: 'center',
                    spacing: 2,
                    className: 'controles-media',
                    children: [
                        Widget.Button({ className: 'btn-control', label: '󰒮', onClicked: () => mpris.players[0]?.previous() }),
                        Widget.Button({ className: 'btn-control', label: '󰐎', onClicked: () => mpris.players[0]?.playPause() }),
                        Widget.Button({ className: 'btn-control', label: '󰒭', onClicked: () => mpris.players[0]?.next() }),
                    ],
                }),

                Widget.Label({
                    className: 'barra-cava',
                    hpack: 'center',
                    label: cavaVar.bind().transform(out => {
                        if (!out) return '';
                        return out.split(';').slice(0, -1).map(v => crearBarras(parseInt(v))).join('');
                    }),
                }),
            ],
        }),
    ],
})

App.config({
    style: App.configDir + '/style.css',
    windows: [
        Widget.Window({
            name: 'reproductor',
            anchor: ['top', 'left'],
            margins: [15, 15],
            visible: false,
            child: Reproductor(),
        })
    ],
})
