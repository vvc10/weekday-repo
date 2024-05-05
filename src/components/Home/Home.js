import React, { useState, useEffect, useRef } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import './Home.css';
import JobCard from './JobCard.js';
import Loader from '../Loader.js';
import NullJobs from './NullJobs.js'; // Assuming NullJobs component exists

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    minExperience: '',
    companyName: '',
    location: '',
    remote: '',
    techStack: '',
    role: '',
    minBasePay: ''
  });
  const observer = useRef();

  const lastJobCardRef = useRef();

  useEffect(() => {
    const fetchJobs = async () => {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const body = JSON.stringify({
        limit: 8,
        offset: 0
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body
      };

      try {
        const response = await fetch(
          'https://api.weekday.technology/adhoc/getSampleJdJSON',
          requestOptions
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log('Fetched data:', data.jdList); // Log the fetched data
        if (!Array.isArray(data.jdList)) {
          throw new Error('Data format is not correct');
        }
        setJobs(data.jdList);
        setLoading(false);
        setHasMore(data.jdList.length > 0);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    }, options);

    if (lastJobCardRef.current) {
      observer.current.observe(lastJobCardRef.current);
    }

    return () => observer.current.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    const fetchMoreJobs = async () => {
      setLoading(true);
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const body = JSON.stringify({
        limit: page * 8,
        offset: 0
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body
      };

      try {
        const response = await fetch(
          'https://api.weekday.technology/adhoc/getSampleJdJSON',
          requestOptions
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        if (!Array.isArray(data.jdList)) {
          throw new Error('Data format is not correct');
        }
        setJobs(prevJobs => [...prevJobs, ...data.jdList]);
        setLoading(false);
        setHasMore(data.jdList.length > 0);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (page > 1) {
      fetchMoreJobs();
    }
  }, [page]);

  const handleFilterChange = (filterName, value) => {
    // If value is null, set it to an empty string
    const filteredValue = value === null ? '' : value;

    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: filteredValue
    }));
  };


  const applyFilters = (job) => {
    const { minExperience, companyName, location, remote, techStack, role, minBasePay } = filters;

    return (
      (minExperience === '' || job.minExp >= minExperience) &&
      (companyName === '' || (job.companyName && job.companyName.toLowerCase().includes(companyName.toLowerCase()))) &&
      (location === '' || (job.location && job.location.toLowerCase().includes(location.toLowerCase()))) &&
      ((remote === '' && !job.remote) || (job.remote && job.remote.toLowerCase() === remote.toLowerCase())) &&
      (techStack === '' || (job.techStack && job.techStack.toLowerCase().includes(techStack.toLowerCase()))) &&
      (role === '' || (job.jobRole && job.jobRole.toLowerCase().includes(role.toLowerCase()))) &&
      (minBasePay === '' || job.minJdSalary >= minBasePay)
    );
  };


  const filteredJobs = jobs.filter(job => applyFilters(job));

  return (
    <div className='home'>
      <div className='filters search-bar'>
        <Autocomplete
          id="role"
          className='grouped-demo'
          options={["", "Frontend", "Backend", "ios", "Designer", "FullStack", "Flutter", "React Native", "Graphic Designer", "Design manager"]} // Replace with actual role options
          value={filters.role}
          onChange={(e, value) => handleFilterChange('role', value)}
          renderInput={(params) => <TextField {...params} label="Role"
            InputProps={{
              ...params.InputProps,
              endAdornment: !filters.role ? null : params.InputProps.endAdornment,
            }} />}
        />
        <Autocomplete
          id="minExperience"
          className='grouped-demo'
          options={["", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          value={filters.minExperience}
          onChange={(e, value) => handleFilterChange('minExperience', value)}
          renderInput={(params) => <TextField {...params} label="Min Experience"

            InputProps={{
              ...params.InputProps,
              endAdornment: !filters.minExperience ? null : params.InputProps.endAdornment,
            }}
          />}
        />

        <Autocomplete
          id="techStack"
          className='grouped-demo'
          options={["", "ReactJS", "Java", "NodeJS", "Redux", "Material UI"]} // Replace with actual tech stack options
          value={filters.techStack}
          onChange={(e, value) => handleFilterChange('techStack', value)}
          renderInput={(params) => <TextField {...params} label="Tech Stack"
            InputProps={{
              ...params.InputProps,
              endAdornment: !filters.techStack ? null : params.InputProps.endAdornment,
            }}
          />}
        />


        <Autocomplete
          id="location"
          className='grouped-demo'
          options={["", "Pune", "Mumbai", "Bangalore", "Tamil Nadu", "West Bengal", "New Delhi"]} // Replace with actual locations
          value={filters.location}
          onChange={(e, value) => handleFilterChange('location', value)}
          renderInput={(params) => <TextField {...params} label="Location"
            InputProps={{
              ...params.InputProps,
              endAdornment: !filters.location ? null : params.InputProps.endAdornment,
            }}
          />}
        />
        <Autocomplete
          id="remote"
          className='grouped-demo'
          options={["", "remote", "on-site"]}
          value={filters.remote}
          onChange={(e, value) => handleFilterChange('remote', value)}
          renderInput={(params) => <TextField {...params} label="Remote/On-site"
            InputProps={{
              ...params.InputProps,
              endAdornment: !filters.remote ? null : params.InputProps.endAdornment,
            }}
          />}
        />
        <TextField
          id="companyName"
          className='grouped-demo'
          label="Company name"
          type="text"
          value={filters.companyName}
          onChange={(e) => handleFilterChange('companyName', e.target.value)}
        />
        <Autocomplete
          id="minBasePay"
          className='grouped-demo'
          options={[0, 100, 200, 300, 400]} // Example options
          renderInput={(params) => (
            <TextField
              {...params}
              label="Min Base Pay"
              InputProps={{
              ...params.InputProps,
              endAdornment: !filters.remote ? null : params.InputProps.endAdornment,
            }}
            />
          )}
          value={filters.minBasePay}
          onChange={(e, value) => handleFilterChange('minBasePay', value)}
        />
      </div>
      <div className='jobs_sec'>
        <h1>Jobs:</h1>
        <div className="job-list">
          {loading ? (
            <Loader />
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <div key={index}>
                <JobCard
                  companyName={job.companyName}
                  jdLink={job.jdLink}
                  jobDetailsFromCompany={job.jobDetailsFromCompany}
                  jobRole={job.jobRole}
                  location={job.location}
                  logoUrl={job.logoUrl}
                  maxExp={job.maxExp}
                  maxJdSalary={job.maxJdSalary}
                  minExp={job.minExp || job.maxExp} // If min experience is null, use max experience
                  minJdSalary={job.minJdSalary || job.maxJdSalary} // If min salary is null, use max salary
                  salaryCurrencyCode={job.salaryCurrencyCode}
                  filters={filters}
                />
                {index === filteredJobs.length - 1 && <div ref={lastJobCardRef}></div>}
              </div>
            ))
          ) : (
            <NullJobs />
          )}
          {!loading && !hasMore && <p>No more jobs</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;
