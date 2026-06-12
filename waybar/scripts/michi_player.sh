#!/bin/bash

if [ "$1" == "archivo" ]; then
    eww close michi_menu
    ARCHIVOS=$(zenity --file-selection --multiple --title="Selecciona tu canción")

    if [ -n "$ARCHIVOS" ]; then
        killall mpv
        IFS='|' read -ra LISTA_ARCHIVOS <<< "$ARCHIVOS"
        # Lanzamos mpv desconectado del script
        nohup mpv --force-window=no --vo=null --shuffle --loop-playlist "${LISTA_ARCHIVOS[@]}" >/dev/null 2>&1 &
        disown
    fi

elif [ "$1" == "directorio" ]; then
    eww close michi_menu
    CARPETA=$(zenity --file-selection --directory --title="Selecciona la carpeta de música")

    if [ -n "$CARPETA" ]; then
        killall mpv
        # Lanzamos mpv desconectado del script
        nohup mpv --force-window=no --vo=null --shuffle --loop-playlist "$CARPETA" >/dev/null 2>&1 &
        disown
    fi

else
    eww open michi_menu --toggle
fi
