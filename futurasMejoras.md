# Futuras Mejoras y Recomendaciones

1. Filtro por: vistos / pendientes / próximos a emitirse.
2. Scroll automático al primer episodio pendiente al abrir detalles.
3. Botón "Marcar siguiente" que automáticamente marca el próximo episodio válido.
4. Manejo visual de errores en carga de episodios (retry button).
5. Estado de carga granular por serie (spinner en cada card si falta info específica).
6. Persistir el conteo de episodios junto a la serie para evitar fetch duplicado (mover caché a contexto y compartir con detalle).
7. Extraer lógica de progreso a un hook reutilizable (useShowProgress(showId)).
8. Memoización de cálculos de progreso.
9. Extraer bloques grandes en `TrackedShowDetailsPage` (EpisodeList, ShowHeader, ProgressBar).
10. Añadir ESLint + Prettier (consistencia de código).
11. Centralizar estilos de colores (variables CSS) para facilitar temas.
12. Tema claro/oscuro y selector automático según preferencia del sistema.
13. Contraste de colores validado (usar herramienta WCAG).
14. Texto alternativo descriptivo para imágenes (no solo el nombre de la serie).
15. Mostrar mini-poster o thumbnail junto a cada episodio.
16. Reordenar manualmente series (drag & drop) además de orden automático por último visto.
17. Reorganizar cards: modo compacto y modo detallado para lista de series.
18. Animaciones suaves (transiciones en barras de progreso y check/uncheck episodios).
19. Botón "Marcar temporada completa" con confirmación.
20. Detección de episodios especiales (type !== 'regular') y opción para excluirlos del progreso.
21. Indicador en la card si hay nuevos episodios no vistos desde la última visita.
22. Badge "Nueva temporada" cuando se detectan episodios de una temporada no existente antes.
23. Barra de progreso multi-color (por temporadas completadas).
24. Lista de deseos (watchlist) separada de "siguiendo".
25. Sugerencias mientras escribes (debounce + cache).
26. Filtros en Discover: por rating mínimo, idioma, estado (Running / Ended), género.
27. Precarga (prefetch) de episodios de la serie cuando el usuario pasa el ratón sobre la card.
28. Detectar hiatus: si no hay episodios nuevos en X meses, mostrar aviso.
29. Mostrar tiempo total visto y tiempo restante (sumando runtimes).
30. Tiempo total estimado de visionado.
31. Página de estadísticas más avanzada: gráficas (episodios vistos por día / semana / mes).
32. Rachas (streak): días consecutivos marcando episodios.
33. Logros (badges): "Primera serie completada", "100 episodios vistos", etc. (mas ideas pendientes)
34. Top géneros más vistos.
35. Unificar funciones utilitarias de formato (fecha, listas) en `utils/format.ts`.
36. Calendario de próximos episodios (vista semanal / mensual).
37. Detectar hiatus: si no hay episodios nuevos en X meses (consolidar lógica con calendario).
38. Modo sin spoilers: ocultar títulos o sinopsis de episodios no vistos.
