# Pipeline de música

Para cuando el video lleva canción o música generada. Si traés tu propio tema, saltá al
paso 4.

## 1. Letra primero, aprobada por un humano
El modelo escribe la letra y se muestra **antes** de generar audio. Cambiar la letra
después de generar cuesta otra tanda entera.

## 2. Generar varias tomas
Con un modelo de música local y open-source (ej. ACE-Step 1.5, corre en una laptop de
16 GB) el costo es cero y cada toma tarda pocos minutos. Generá **3–4 tomas** del mismo
tema. Ojo con el espacio en disco: los pesos del modelo ocupan varios GB.

## 3. Elegir por claridad, no por gusto
Las voces sintéticas se comen palabras. Para cada toma:
- transcribila con un modelo de speech-to-text;
- compará la transcripción con la letra y contá cuántas palabras se entienden;
- quedate con la toma de mayor coincidencia.

**Truco de pronunciación:** si el modelo dice mal una palabra (nombres propios, marcas),
escribila fonéticamente en la letra (ej. "Claude" → "Clawd") y regenerá. La pantalla
puede mostrar la ortografía correcta; lo fonético es solo para el audio.

## 4. Separar voz y tiempos por palabra
- Separá voz e instrumental (stem split).
- Sacá el tiempo de inicio y fin de **cada palabra** sobre la pista de voz (alineación
  forzada o transcripción con timestamps por palabra).
- Guardá esos tiempos como datos del proyecto: son la grilla sobre la que se cortan los
  planos y aparece cada palabra en pantalla.

## 5. Sincronizar
Las escenas leen la grilla de palabras y de beats; no se calcula a ojo. Una palabra en
pantalla aparece cuando se canta, no "más o menos ahí".

## Qué reportar
Toma elegida, porcentaje de palabras entendidas, qué se escribió fonéticamente, y si algo
del audio fue pago.
