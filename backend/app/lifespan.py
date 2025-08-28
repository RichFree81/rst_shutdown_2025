# Ensure the default 'how' domain exists
    if not db.query(Domain).filter(Domain.id == "how").first():
        db.add(Domain(id="how", name="How"))
        db.commit()
