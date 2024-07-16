module.exports = {
  schema: {
    status: String,
    image: String,
    length: String,
    weight: String,
    width: String,
    height: String,
    translations: Array,
  },
  data: [
    [
      {
        status: 'ACTIVE',
        image: 'https://google.com',
        length: '10km',
        weight: '20lb',
        width: '11km',
        height: '25km',
        translation: {
          uz: {
            name: 'Ayollar oyoq kiyimi',
            description: 'Ayollar oyoq kiyimi',
          },
          ru: {
            name: 'Женская обувь',
            description: 'Женская обувь',
          },
          en: {
            name: `Women's shoes`,
            description: `Women's shoes`,
          },
        },
      },
      {
        status: 'INACTIVE',
        image: 'https://google.com',
        length: '10km',
        weight: '20lb',
        width: '11km',
        height: '25km',
        translation: {
          uz: {
            name: 'Erkaklar oyoq kiyimi',
            description: 'Erkaklar oyoq kiyimi',
          },
          ru: {
            name: 'Мужская обувь',
            description: 'Мужская обувь',
          },
          en: {
            name: 'English обувь',
            description: 'English обувь',
          },
        },
      },
      {
        status: 'DEFAULT',
        image: 'https://google.com',
        length: '10km',
        weight: '20lb',
        width: '11km',
        height: '25km',
        translation: {
          uz: {
            name: 'Qiz bolalar oyoq kiyimi',
            description: 'Qiz bolalar oyoq kiyimi',
          },
          ru: {
            name: 'Обувь для девочек',
            description: 'Обувь для девочек',
          },
          en: {
            name: 'English девочек',
            description: 'English девочек',
          },
        },
      },
      {
        status: 'DEFAULT',
        image: 'https://google.com',
        length: '10km',
        weight: '20lb',
        width: '11km',
        height: '25km',
        translation: {
          uz: {
            name: 'O’g’il bolalar oyoq kiyimi',
            description: 'O’g’il bolalar oyoq kiyimi',
          },
          ru: {
            name: 'Обувь для мальчиков',
            description: 'Обувь для мальчиков',
          },
          en: {
            name: 'English мальчиков',
            description: 'English мальчиков',
          },
        },
      },
    ],
  ],
};
