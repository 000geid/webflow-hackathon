/**
 * Copia texto al portapapeles. La API moderna solo existe en contextos seguros (https o localhost)
 * y con la pestaña enfocada; si no está, se usa el método clásico con un textarea oculto
 * (por ejemplo, al probar desde el celular con la IP de la red local).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* sigue con el método clásico */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch {
    return false;
  }
}
