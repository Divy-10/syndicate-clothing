import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CategoryPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryPage = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories/all`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/categories/add`, { name });
      setName('');
      fetchCats();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding category');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#0a0a0a',
      color: '#E1DCC9',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#B8B1A1'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/categories/delete/${id}`);
      fetchCats();
      Swal.fire({
        title: 'Deleted!',
        text: 'Category has been deleted.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#E1DCC9',
        confirmButtonColor: '#B8B1A1'
      });
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="category-admin-container animate-fade-in-up">
      <div className="page-header">
        <h1>Category Management</h1>
        <p>Create and manage your clothing collections</p>
      </div>

      <div className="add-category-card">
        <form onSubmit={handleAdd} className="add-category-form-inner">
          <input 
            placeholder="Enter category name (e.g. Luxury Jackets)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
        {error && <p className="category-error">{error}</p>}
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center">No categories defined yet.</td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id}>
                  <td className="font-bold">{cat.name}</td>
                  <td className="text-right">
                    <button className="btn-delete" onClick={() => deleteCategory(cat._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryPage;
