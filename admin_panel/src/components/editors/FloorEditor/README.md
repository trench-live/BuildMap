# Floor Editor

Редактор этажей для настройки точек маршрутизации (`fulcrums`) и связей между ними.

## Основные действия

### Точки
- Создание: ПКМ по карте
- Редактирование: ПКМ по точке
- Создание связи: зажать ЛКМ на точке и перетащить к другой точке
- Режим перемещения: включить `Двигать точки`

### Типы точек
- Waypoint
- Комната
- Лестница
- Лифт
- Вход
- Зал
- Туалет
- Кухня
- Ресепшен
- Аварийный выход
- Ориентир

`Waypoint` это служебная промежуточная точка для построения маршрута. Обычно она используется для проходов, поворотов и промежуточных узлов графа.

## Использование

```jsx
import FloorEditor from './components/editors/FloorEditor';

<FloorEditor
  floor={currentFloor}
  visible={isEditorOpen}
  onClose={handleCloseEditor}
  onSave={handleSaveFloor}
/>
```

## Данные

### Fulcrum

```javascript
{
  id: Long,
  name: String,
  description: String,
  x: Double,
  y: Double,
  type: FulcrumType,
  floorId: Long
}
```

### Connection

```javascript
{
  from: Long,
  to: Long,
  distanceMeters: Double,
  difficultyFactor: Double
}
```
