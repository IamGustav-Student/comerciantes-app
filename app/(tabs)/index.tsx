import ComercioList from '../../components/ComercioList';

export default function ComerciantesScreen() {
  return (
    <ComercioList
      soloAgro={false}
      colorAcento="#e11d48"
      textoVacio="Todavía no hay comercios cargados. ¡Volvé pronto!"
      mostrarSeccionesCuradas
    />
  );
}
