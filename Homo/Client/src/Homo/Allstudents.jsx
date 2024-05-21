  import React, { useState} from "react";
  import axios from "axios";

  const Home = () => {

    const [form, setForm] = useState({
      prescription: ""
  });
  const [reportForm, setReportForm] = useState({
    bloodp: '',
    bloodsugar: '',
    bloodcount: '',
    bloodtype: '',
    height: '',
    weight: '',
    age: '',
  });

    const handleReportChange = (event) => {
      const { name, value } = event.target;
      setReportForm({ ...reportForm, [name]: value });
    };

    const updatePatientReport = async (event) => {
      event.preventDefault();
    
      const response = await axios.post(`/api`, reportForm);
      if (response.data.status)
      {
        alert("Profile updated!");
        window.location.reload();
      }else{
        alert("Something went wrong!");
    
      }
    };
    
      return (
        <>
        <div className="center-container">
    <div className="mt-4 statbox widget box neumorphic-container">
      <div className="layout-top-spacing row layout-spacing">
      <div className="col-md-6">
          <div className="mt-4 statbox widget box neumorphic-container">
            <div className="widget-header">
                <div className="row">
                  <div className="col-xl-12 col-md-12 col-sm-12 col-12">
                    <h4 className="neumorphic-title">Health Report</h4>
                  </div>
                </div>
              </div>
              <div className="widget-content widget-content-area">
                <form onSubmit={updatePatientReport}>
                  <input type='text' onChange={handleReportChange} required name='maths' className="neumorphic-input" placeholder='Average blood preasure' />
                  <input type='text' onChange={handleReportChange} required name='science' className="neumorphic-input" placeholder='Average blood sugar' />
                  <input type='text' onChange={handleReportChange} required name='history' className="neumorphic-input"  placeholder='Blood count' />
                  <input type='text' onChange={handleReportChange} required name='geography' className="neumorphic-input"  placeholder='Blood type' />
                  <input type='text' onChange={handleReportChange} required name='arts' className="neumorphic-input"  placeholder='Height' />
                  <input type='text' onChange={handleReportChange} required name='music' className="neumorphic-input"  placeholder='Weight' />
                  <input type='text' onChange={handleReportChange} required name='ict' className="neumorphic-input"  placeholder='Age' />
                  <div className="form-button-container">
                  <button className="btn btn-primary neumorphic-button">Submit</button>
                  </div>
                </form>
              </div>
          </div>
      </div>
      </div>
      </div>
      </div>

      
      </>
      );
    };
    
    export default Home;

