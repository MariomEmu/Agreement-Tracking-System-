export const AgreementChart = () => {
  const departments = [
    { name: 'HR', value: 15 },
    { name: 'Admin', value: 10 },
    { name: 'IT', value: 5 },
    { name: 'BDO', value: 0 },
    { name: 'Others', value: 5 }
  ];

  return (
    <div className="agreement-chart">
      <h3>Agreement by Department</h3>
      <div className="bar-chart">
        {departments.map((dept) => (
          <div key={dept.name} className="bar-container">
            <div 
              className="bar" 
              style={{ height: `${dept.value * 5}px` }}
            >
              {dept.value}
            </div>
            <span className="bar-label">{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};