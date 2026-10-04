export const mapelSD = {
  1: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Seni Budaya', 'PJOK'],
  2: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Seni Budaya', 'PJOK'],
  3: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Seni Budaya', 'PJOK'],
  4: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Seni Budaya', 'PJOK'],
  5: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'Seni Budaya', 'PJOK'],
  6: ['Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'Seni Budaya', 'PJOK'],
};

export const mapelSMP = {
  7: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'Seni Budaya',
    'PJOK',
    'TIK',
    'Prakarya',
    'Bahasa Daerah',
  ],
  8: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'Seni Budaya',
    'PJOK',
    'TIK',
    'Prakarya',
    'Bahasa Daerah',
  ],
  9: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'IPA',
    'IPS',
    'Seni Budaya',
    'PJOK',
    'TIK',
    'Prakarya',
    'Bahasa Daerah',
  ],
};

export const mapelSMA = {
  10: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Sosiologi',
    'Ekonomi',
    'Seni Budaya',
    'PJOK',
  ],
  11: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Sosiologi',
    'Ekonomi',
    'Seni Budaya',
    'PJOK',
  ],
  12: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Sosiologi',
    'Ekonomi',
    'Seni Budaya',
    'PJOK',
  ],
};

export const mapelSMK = {
  10: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Keterampilan Kejuruan',
    'PJOK',
    'Seni Budaya',
  ],
  11: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Keterampilan Kejuruan',
    'PJOK',
    'Seni Budaya',
  ],
  12: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Keterampilan Kejuruan',
    'PJOK',
    'Seni Budaya',
  ],
  13: [
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Matematika',
    'Fisika',
    'Kimia',
    'Keterampilan Kejuruan',
    'PJOK',
    'Seni Budaya',
  ],
};

export function getMapelByJenjangKelas(jenjang: string, kelas: string): string[] {
  const kelasNum = parseInt(kelas, 10);

  switch (jenjang) {
    case 'SD':
      return mapelSD[kelasNum as keyof typeof mapelSD] || [];
    case 'SMP':
      return mapelSMP[kelasNum as keyof typeof mapelSMP] || [];
    case 'SMA':
      return mapelSMA[kelasNum as keyof typeof mapelSMA] || [];
    case 'SMK':
      return mapelSMK[kelasNum as keyof typeof mapelSMK] || [];
    default:
      return [];
  }
}

export function getAllJenjang(): string[] {
  return ['SD', 'SMP', 'SMA', 'SMK', 'Umum'];
}

export function getKelasOptions(jenjang: string): string[] {
  switch (jenjang) {
    case 'SD':
      return ['1', '2', '3', '4', '5', '6'];
    case 'SMP':
      return ['7', '8', '9'];
    case 'SMA':
      return ['10', '11', '12'];
    case 'SMK':
      return ['10', '11', '12', '13'];
    default:
      return ['Umum'];
  }
}
