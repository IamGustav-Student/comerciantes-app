import ComercioList from '../../components/ComercioList';

export default function AgroScreen() {
  return (
    <ComercioList
      soloAgro={true}
      colorAcento="#2D5A27"
      textoVacio="Todavía no hay agrocomercios cargados. ¡Volvé pronto!"
    />
  );
}
