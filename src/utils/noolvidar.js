 <button onClick={() => { setEditingBusiness(null); setOpenModal(true); }}>
       <IoMdAdd />
      {t("common.addBusiness")}
      </button>

<ul>
        {businesses.map((b) => (
          <li key={b.id} onClick={() => { setEditingBusiness(b); setOpenModal(true); }}>
            <div>
              <div>
                {b.photo && <img src={b.photo} alt={b.name} width="100" />}
              </div>
              <div>
                <h3>{b.name}</h3>
                <p>{b.address}</p>
                <p>{b.contact}</p>
                <p>
                  Horario: {b.hours?.open} - {b.hours?.close}
                </p>
                <p>Categorías: {b.categories?.join(", ")}</p>
              </div>
            </div>
            <button onClick={(e) => {
              confirmDelete(b)
              e.stopPropagation();
            }}>Eliminar</button>
          </li>
        ))}
      </ul>

      <h2>Categorías</h2>
      <button onClick={() => {
        setEditingCategory(null);
        setCategoryForm({ name: "", icon: "" });
        setCategoryModalOpen(true);
      }}>
        + Agregar categoría
      </button>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            <span>{cat.icon} {cat.name}</span>
            <button onClick={() => handleCategoryEdit(cat)}>Editar</button>
            <button onClick={() => confirmDeleteCategory(cat)}>Eliminar</button>
          </li>
        ))}
      </ul>