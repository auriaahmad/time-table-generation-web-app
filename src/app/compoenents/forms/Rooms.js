// app/components/forms/Rooms.js
'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { generateId } from '../../utils/dataStructure';

export default function Rooms({ data, onChange }) {
  const [rooms, setRooms] = useState(data || []);

  const roomTypes = ['Classroom', 'Laboratory', 'Auditorium', 'Seminar Room', 'Studio', 'Workshop'];
  const equipmentOptions = ['Projector', 'Computer', 'Whiteboard', 'Smartboard', 'Audio System', 'Video Camera', 'Lab Equipment'];

  const updateRooms = (newRooms) => {
    setRooms(newRooms);
    onChange(newRooms);
  };

  const addRoom = () => {
    const newRoom = {
      id: generateId(),
      name: "",
      building: "",
      floor: 1,
      type: "Classroom",
      capacity: 50,
      equipment: [],
      isAccessible: false,
      hasAC: false,
      unavailableSlots: [],
      preferredFor: [],
      maintenanceSlots: []
    };
    updateRooms([...rooms, newRoom]);
  };

  const removeRoom = (id) => {
    updateRooms(rooms.filter(room => room.id !== id));
  };

  const updateRoom = (id, field, value) => {
    updateRooms(rooms.map(room => 
      room.id === id ? { ...room, [field]: value } : room
    ));
  };

  const toggleEquipment = (id, equipment) => {
    const room = rooms.find(r => r.id === id);
    const currentEquipment = room.equipment || [];
    const newEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
    updateRoom(id, 'equipment', newEquipment);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Rooms & Facilities</h3>
            <p className="text-gray-600">Configure physical spaces and their capabilities</p>
          </div>
        </div>
        <button onClick={addRoom} className="flex items-center gap-2 btn-primary">
          <Plus size={16} />
          Add Room
        </button>
      </div>

      <div className="space-y-4">
        {rooms.map((room, index) => (
          <div key={room.id} className="card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name/Number</label>
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                  className="input-field"
                  placeholder="A-101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <input
                  type="text"
                  value={room.building}
                  onChange={(e) => updateRoom(room.id, 'building', e.target.value)}
                  className="input-field"
                  placeholder="Main Building"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="number"
                  value={room.floor}
                  onChange={(e) => updateRoom(room.id, 'floor', parseInt(e.target.value))}
                  className="input-field"
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={room.type}
                  onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                  className="input-field"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={room.capacity}
                  onChange={(e) => updateRoom(room.id, 'capacity', parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                  max="500"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={room.isAccessible}
                    onChange={(e) => updateRoom(room.id, 'isAccessible', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Accessible</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={room.hasAC}
                    onChange={(e) => updateRoom(room.id, 'hasAC', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Air Conditioned</span>
                </label>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeRoom(room.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove room"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Equipment</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {equipmentOptions.map(equipment => (
                  <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={room.equipment?.includes(equipment) || false}
                      onChange={() => toggleEquipment(room.id, equipment)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {rooms.length === 0 && (
          <div className="card text-center py-8">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Rooms Added</h4>
            <p className="text-gray-600 mb-4">Add rooms and facilities for your university</p>
            <button onClick={addRoom} className="btn-primary">Add First Room</button>
          </div>
        )}
      </div>
    </div>
  );
}