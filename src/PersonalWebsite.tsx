interface PersonalWebsiteProps {
  onBackToTerminal: () => void;
}

const PersonalWebsite = ({ onBackToTerminal }: PersonalWebsiteProps) => {
  return (
    <div className="website-container">
      <button onClick={onBackToTerminal} className="back-to-terminal">
        Back to Terminal
      </button>

      <main className="website-content">
        <section className="hero">
          <h1>Nusret Ali Kızılaslan</h1>
          <h2>Computer Engineer</h2>
        </section>

        <section className="about">
          <h3>About Me</h3>
          <p>
            I'm a software engineer graduated from Sabancı University with a
            degree in Computer Science & Engineering and a minor in Finance.
            Currently working at Valensas, developing both backend and frontend
            applications for businesses.
          </p>
        </section>

        <section className="experience">
          <h3>Experience</h3>
          <div className="job">
            <h4>Software Engineer</h4>
            <div className="company">Valensas</div>
            <div className="date">June 2024 - Present</div>
            <p>Developing backend and frontend applications for businesses</p>
          </div>
          <div className="job">
            <h4>Software Engineer</h4>
            <div className="company">Kordsa The Reinforcer</div>
            <div className="date">July 2022</div>
            <p>
              Developed DataCom and KordsaConnect mobile applications,
              contributed to company chatbot
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PersonalWebsite;
