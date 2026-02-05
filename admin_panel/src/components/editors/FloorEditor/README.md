# Floor Editor - Система Fulcrums

## Обзор
Редактор этажей с поддержкой создания точек (fulcrums) и связей между ними для системы indoor-навигации.

## Основные возможности

### Точки (Fulcrums)
- Создание: ПКМ по карте → форма создания
- Редактирование: ПКМ по точке → форма редактирования
- Перетаскивание: ЛКМ по точке для создания связей
- Типы точек: Комната, Коридор, Лестница, Лифт, Вход, Зал, Туалет, Кухня, Ресепшен, Аварийный выход, Ориентир

### Связи (Connections)
- Создание: Зажать ЛКМ на точке и перетащить к другой точке
- Редактирование: ПКМ по связи → форма редактирования веса
- Вес связи: Влияет на расчет маршрутов (1.0 - нормально, 2.0 - сложнее, 0.5 - легче)

## Использование

```jsx
import FloorEditor from './components/editors/FloorEditor';

// В компоненте родителя
<FloorEditor
  floor={currentFloor}
  visible={isEditorOpen}
  onClose={handleCloseEditor}
  onSave={handleSaveFloor}
/>
```

# Структура данных
## Fulcrum (Точка)
```javascript
{
  id: Long,
  name: String,        // Название (обязательно)
  description: String, // Описание
  x: Double,          // Координата X
  y: Double,          // Координата Y
  type: FulcrumType,  // Тип точки
  floorId: Long       // ID этажа
}
```

## Connection (Связь)
```javascript
{
  from: Long,         // ID исходной точки
  to: Long,           // ID целевой точки
  weight: Double      // Вес связи
}
```

# API методы
**Система автоматически использует следующие API методы:**
```
fulcrumAPI.getByFloor(floorId) - загрузка точек этажа
fulcrumAPI.create(fulcrumData) - создание точки
fulcrumAPI.update(id, fulcrumData) - обновление точки
fulcrumAPI.delete(id) - удаление точки
fulcrumAPI.addConnection(id, connectionData) - добавление связи
fulcrumAPI.removeConnection(fromId, toId) - удаление связи
```