import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

interface AuthorTextsFilterProps {
  value: number;
  maximum: number;
  onChange: (value: number) => void;
  onApply: () => void;
  onReset: () => void;
}

export function AuthorTextsFilter({ value, maximum, onChange, onApply, onReset }: AuthorTextsFilterProps) {
  return (
    <Form className="author_texts_filter" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <Form.Label htmlFor="author_texts_minimum" className="author_texts_filter_label">Минимальная длина текста</Form.Label>
      <output htmlFor="author_texts_minimum" className="author_texts_filter_value" aria-live="polite">{value.toLocaleString('ru-RU')} токенов</output>
      <Form.Range
        id="author_texts_minimum" min={0} max={maximum} step={1000} value={value}
        aria-valuetext={`${value.toLocaleString('ru-RU')} токенов`}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <div className="author_texts_filter_scale" aria-hidden="true"><span>0</span><span>{maximum.toLocaleString('ru-RU')}</span></div>
      <div className="author_texts_filter_actions">
        <Button type="submit" variant="secondary">Применить</Button>
        <Button type="button" variant="secondary" onClick={onReset}>Сбросить</Button>
      </div>
    </Form>
  );
}
