/**
 * CENTRAL IMAGE LIBRARY
 * ---------------------
 * Every demo photo used by the site is registered here under a semantic key.
 * Values are Unsplash photo ids (free to use under the Unsplash License, no attribution required).
 *
 * To replace demo imagery with real seller photos later:
 *   - either change the id/URL for a key here (all products using it update at once), or
 *   - give a product `images: [{ url: 'https://cdn.seller.com/p/123.jpg' }]` (see ProductImage).
 * URL building lives in utils/images.ts.
 */
export const IMAGE_LIBRARY = {
  // Dresses
  floralWrap: '1496747611176-843222e1e57c',
  rubyMaxi: '1595777457583-95e059d581b8',
  plumGown: '1566174053879-31528523f8ae',
  polkaDot: '1502716119720-b23a93e5fe1b',
  denimShirtDress: '1591369822096-ffd140ec948f',
  corduroyDress: '1585487000160-6ebcfceb0d03',
  ruffleMini: '1515372039744-b8f02a3ae446',
  wineTulle: '1550928431-ee0ec6db30d3',
  navySatin: '1736342182642-e2042084f47c',
  blackModestMaxi: '1668028554854-245f8ccae15b',
  // Sets & jumpsuits
  jumpsuit: '1495385794356-15371f348c31',
  tracksuit: '1515886657613-9f3515b0c78f',
  sequinSet: '1550614000-4895a10e1bfd',
  turtleneckSkirtSet: '1550639525-c97d455acf70',
  pleatSkirtBlouse: '1551163943-3f6a855d1153',
  // Bottoms
  satinJoggers: '1594633312681-425c7b97ccd1',
  stripeTrousers: '1521577352947-9bb58764b69a',
  cargo: '1552902865-b72c031ac5ea',
  patchJeans: '1541099649105-f69ad21f3246',
  blackPleatSkirt: '1591948083708-6edc852d7275',
  ivoryPleatSkirt: '1762343041573-aa2827852bc9',
  ivoryPleatSkirt2: '1762342685668-a76f1a57d7d1',
  ivoryPleatSkirt3: '1762342676026-09e25daaf607',
  // Tops
  stripeShirt: '1583496661160-fb5886a0aaaa',
  broderie: '1549062572-544a64fb0c56',
  embroideredBlouse: '1564257631407-4deb1f99d992',
  linenTunic: '1584030373081-f37b7bb4fa8e',
  puffBlouse: '1581044777550-4cfa60707c03',
  turtleneckKnit: '1504703395950-b89145a5425b',
  chevronSweater: '1475180098004-ca77a66827be',
  // Outerwear
  poncho: '1434389677669-e08b4cac3105',
  creamBlazer: '1571513722275-4b41940f54b8',
  plaidBlazer: '1485968579580-b6d095142e6e',
  burgundyCoat: '1483985988355-763728e1935b',
  skyCoat: '1539109136881-3be0616acf4b',
  // Abayas
  abayaOpen: '1728487235101-664d87965931',
  abayaEmbellished: '1772474500365-c2c520545f44',
  abayaTrim: '1724412665971-114bd351a42d',
  abayaChampagne: '1760083545495-b297b1690672',
  abayaSand: '1762605135376-ae5af70a5628',
  abayaPearl: '1772474578035-bebcd90b355d',
  abayaPanel: '1772474557170-4818d01d7bca',
  // Hijabs
  hijabBlush: '1574297500578-afae55026ff3',
  hijabIvory: '1585728748176-455ac5eed962',
  hijabRose: '1640154852340-9de73a0643a8',
  hijabGold: '1613447895817-e617a4093f50',
  hijabStone: '1613611927458-3ddd4b0afdb9',
  hijabTerracotta: '1662806407800-56793fa8e924',
  hijabPrinted: '1552874869-5c39ec9288dc',
  // Shoes
  floralHeels: '1543163521-1bf539c55dd2',
  navyPumps: '1515347619252-60a4bf4fff4f',
  nudePumps: '1535043934128-cf0b28d52f95',
  brogues: '1560343090-f0409e92791a',
  sneakers: '1603808033192-082d6919d3e1',
  // Bags
  wovenTote: '1598532163257-ae3c6b2524b6',
  strawBag: '1590874103328-eac38a683ce7',
  quiltedBag: '1681747685985-a401c271156c',
  blushFlap: '1683921590274-a83862cb11c3',
  blackTote: '1614179689702-355944cd0918',
  greySatchel: '1605733513597-a8f8341084e6',
  tealSatchel: '1594223274512-ad4803739b7c',
  chevronBag: '1566150905458-1bf1fc113f0d',
  greyFlap: '1683921470299-b8f0f3331657',
  boston: '1705909237050-7a7625b47fac',
  beigeFlap: '1606522754091-a3bbf9ad4cb3',
  crocBucket: '1713425886143-6ea8c776bf2d',
  creamCrescent: '1760624294514-3548bee70d26',
  chainTote: '1663229145211-94d321567f97',
  // Accessories
  sunglasses: '1511499767150-a48a237f0083',
  hoops: '1617038220319-276d3cfab638',
  sapphireEarrings: '1535632066927-ab7c9ab60908',
  crystalBracelet: '1573408301185-9146fe634ad0',
  roseBracelet: '1611591437281-460bfbe1220a',
  chains: '1606760227091-3dd870d97f1d',
  silkScarf: '1689193502879-362660fad4a8',
  pashmina: '1517472292914-9570a594783b',
  chiffonScarf: '1677478863154-55ecce8c7536',
  // Editorial (hero, banners, country tiles)
  edOfficeSpring: '1566534335938-05f1f2949435',
} as const

export type ImageKey = keyof typeof IMAGE_LIBRARY
