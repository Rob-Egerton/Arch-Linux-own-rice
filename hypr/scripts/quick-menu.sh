#!/bin/bash
options="󰑓 Reiniciar\n󰐥 Apagar\n Bloquear\n󰍃 Cerrar Sesión"
chosen="$(echo -e "$options" | wofi --dmenu --conf ~/.config/wofi/config.quick --style ~/.config/wofi/style.quick --prompt 'Acciones')"

case "$chosen" in
    *"Apagar") systemctl poweroff ;;
    *"Reiniciar") systemctl reboot ;;
    *"Bloquear") hyprlock ;;
    *"Cerrar Sesión") hyprctl dispatch exit ;;
esac
