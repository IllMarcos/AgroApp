export interface FitoInfo {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: any; // <- ahora usa require()
}

export const PLAGAS_DATA: FitoInfo[] = [
  {
    id: 'p1',
    nombre: 'Ácaros',
    descripcion: 'Diminutos arácnidos que succionan la savia, causando decoloración.',
    imagen: require('@/app/assets/images/fito/acaros.png'),
  },
  {
    id: 'p2',
    nombre: 'Gusano Alfiler',
    descripcion: 'Pequeña larva que perfora los frutos, especialmente tomates.',
    imagen: require('@/app/assets/images/fito/gusano-alfiler.png'),
  },
  {
    id: 'p3',
    nombre: 'Mosca Blanca',
    descripcion: 'Insecto volador que succiona savia y transmite virus.',
    imagen: require('@/app/assets/images/fito/mosca-blanca.png'),
  },
  {
    id: 'p4',
    nombre: 'Pulgón',
    descripcion: 'Se agrupan en brotes y hojas, succionando savia y debilitando la planta.',
    imagen: require('@/app/assets/images/fito/pulgon.png'),
  },
  {
    id: 'p5',
    nombre: 'Trips',
    descripcion: 'Insectos diminutos que raspan las hojas, dejando manchas plateadas.',
    imagen: require('@/app/assets/images/fito/trips.png'),
  },
  {
    id: 'p6',
    nombre: 'Gusano Cogollero',
    descripcion: 'Ataca el cogollo de plantas como el maíz, causando daños severos.',
    imagen: require('@/app/assets/images/fito/gusano-cogollero.png'),
  },
];

export const ENFERMEDADES_DATA: FitoInfo[] = [
  {
    id: 'e1',
    nombre: 'Tizón Temprano',
    descripcion: 'Hongo que causa manchas anulares oscuras en hojas, tallos y frutos.',
    imagen: require('@/app/assets/images/fito/tizon-temprano.png'),
  },
  {
    id: 'e2',
    nombre: 'Cenicilla',
    descripcion: 'Hongo que se manifiesta como un polvo blanco o grisáceo sobre las hojas.',
    imagen: require('@/app/assets/images/fito/cenicilla.png'),
  },
  {
    id: 'e3',
    nombre: 'Mildiu Velloso',
    descripcion: 'Causa manchas amarillas en el haz de las hojas y un moho velloso en el envés.',
    imagen: require('@/app/assets/images/fito/mildiu-velloso.png'),
  },
  {
    id: 'e4',
    nombre: 'Fusarium',
    descripcion: 'Hongo del suelo que causa marchitamiento y pudrición de la raíz.',
    imagen: require('@/app/assets/images/fito/fusarium.png'),
  },
  {
    id: 'e5',
    nombre: 'Mancha Bacteriana',
    descripcion: 'Provoca pequeñas manchas acuosas en las hojas que se vuelven necróticas.',
    imagen: require('@/app/assets/images/fito/mancha-bacteriana.png'),
  },
  {
    id: 'e6',
    nombre: 'Botrytis',
    descripcion: 'Moho gris que afecta flores, frutos y brotes, especialmente en condiciones húmedas.',
    imagen: require('@/app/assets/images/fito/botrytis.png'),
  },
];
