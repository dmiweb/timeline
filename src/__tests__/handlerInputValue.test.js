import Geolication from "../js/api/Geolocation/Geolocation";
const geolocation = new Geolication();

test.each([
  ['coords', '51.50851, -0.12572', '51.50851, -0.12572'],
  ['coords', '51.50851,-0.12572', '51.50851, -0.12572'],
  ['coords', '[51.50851, -0.12572]', '51.50851, -0.12572']
])(
  ('testing function handlerInputValue for %s coords with %i position'),
  (_, position, expected) => {
    const result = geolocation.handlerInputValue(position);

    expect(result).toBe(expected);
  }
);