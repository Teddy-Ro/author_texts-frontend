import type { AuthorTextsAttribute } from '../modules/author_texts_types';

export function AuthorTextsAttributes({ attributes }: { attributes: readonly AuthorTextsAttribute[] }) {
  return <section className="author_texts_attributes">
    <h2>Дополнительные характеристики</h2>
    {attributes.length ? <table>
      <thead><tr><th scope="col">Атрибут</th><th scope="col">Значение</th></tr></thead>
      <tbody>{attributes.map((attribute) => <tr key={attribute.author_texts_attribute_id}>
        <th scope="row">{attribute.attribute_name}</th><td>{attribute.attribute_value}</td>
      </tr>)}</tbody>
    </table> : <p>Характеристики пока не заполнены.</p>}
  </section>;
}
