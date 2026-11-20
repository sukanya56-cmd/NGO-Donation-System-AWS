import { useEffect, useState } from "react";
import "./App.css";
import NGODashboard from "./pages/NGODashboard";
import AdminDashboard from "./pages/ADMINDashboard";
import { AuthPortal, DonorDashboard, NGODashboard as NGOWorkspace, AdminPortal, OrganizationDetail, DonationPortal, RegisteredOrganizationCards } from "./pages/PortalPages";
const causeContent = {
  education: {
    title: "Education for Every Future",
    shortTitle: "Education",
    intro: "Every child deserves the opportunity to learn, grow and shape their future.",
    challenges: "Barriers can include the cost of school supplies, limited access to learning resources, digital exclusion, and difficulty staying in school.",
    approach: "Sahayata aims to connect supporters with organizations working on learning resources, educational access, digital learning and community-based education initiatives."
  },
  healthcare: {
    title: "Health and Dignity for All",
    shortTitle: "Healthcare",
    intro: "Access to timely, affordable healthcare can make a meaningful difference to individuals and families.",
    challenges: "Communities may face barriers such as healthcare costs, limited local services, gaps in health awareness and difficulty accessing essential medical supplies.",
    approach: "Sahayata aims to highlight organizations working on community health camps, health awareness, medical assistance and access to essential healthcare resources."
  },
  food: {
    title: "Food Security and Better Nutrition",
    shortTitle: "Food & Nutrition",
    intro: "Nutritious food is essential for health, learning, growth and a life lived with dignity.",
    challenges: "Food insecurity, rising household costs, unequal access to nutritious meals and limited nutrition awareness can affect vulnerable communities.",
    approach: "Sahayata aims to connect supporters with organizations working on meal distribution, nutrition awareness, food assistance and community food programmes."
  },
  animals: {
    title: "Compassion for Every Animal",
    shortTitle: "Animal Welfare",
    intro: "Animals need protection, responsible care and access to treatment when they are hurt or unwell.",
    challenges: "Stray and abandoned animals may face injury, illness, hunger, unsafe living conditions and limited access to veterinary care.",
    approach: "Sahayata aims to showcase organizations involved in animal rescue, shelter, veterinary assistance, feeding programmes and animal welfare awareness."
  },
  women: {
    title: "Stronger Women, Stronger Communities",
    shortTitle: "Women & Community Welfare",
    intro: "Inclusive communities grow when people have access to safety, opportunity, skills and support.",
    challenges: "Challenges may include unequal access to education and employment, limited skills-training opportunities, social exclusion and barriers to essential support.",
    approach: "Sahayata aims to highlight organizations supporting women's empowerment, skills development, livelihood opportunities and community-led initiatives."
  }
};
async function uploadFileToS3(file, folder) {
  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("file", file);

  const response = await fetch("http://13.233.131.84:5000/api/upload-file", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "File upload failed");
  }

  return result;
}
function App() {
  const [page, setPage] = useState("home");
  const [showAllCauses, setShowAllCauses] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
const [menuNotice, setMenuNotice] = useState("");
const [selectedCause, setSelectedCause] = useState(null);
  const [requirements, setRequirements] = useState([]);

  const [showDonation, setShowDonation] = useState(false);

  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedDonationRequirement, setSelectedDonationRequirement] = useState(null);

  const [message, setMessage] = useState("");

  const [donation, setDonation] = useState({
    name: "",
    email: "",
    amount: ""
  });

  const exampleRequirements = [
    {
      id: "example1",
      ngoName: "Helping Hand Foundation",
      type: "Money",
      item: "Medical Supplies",
      quantity: 1,
      amount: 50000,
      description: "Funds required for medicines and medical supplies."
    },
    {
      id: "example2",
      ngoName: "Hope Education Trust",
      type: "Supplies",
      item: "School Books",
      quantity: 100,
      amount: 30000,
      description: "Books required for children from underprivileged families."
    },
    {
      id: "example3",
      ngoName: "Care for Animals",
      type: "Supplies",
      item: "Dog Food",
      quantity: 100,
      amount: 20000,
      description: "Food required for rescued and abandoned dogs."
    }
  ];

  async function fetchRequirements() {
    try {
      const response = await fetch(
        "http://13.233.131.84:5000/api/requirements"
      );

      const data = await response.json();

      setRequirements(data);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  useEffect(() => {
    fetchRequirements();
  }, []);

  const allRequirements = [
    ...exampleRequirements,
    ...requirements
  ];

  const uniqueRequirements = allRequirements.filter(
    (item, index, array) => {
      return (
        index ===
        array.findIndex(
          (other) =>
            other.ngoName === item.ngoName &&
            other.type === item.type &&
            other.item === item.item &&
            other.quantity === item.quantity &&
            other.amount === item.amount
        )
      );
    }
  );

  function openDonation(requirement) {
    setSelectedRequirement(requirement);
    setShowDonation(true);
    setMessage("");
  }

  async function submitDonation(event) {
    event.preventDefault();

    if (
      donation.name === "" ||
      donation.email === "" ||
      donation.amount === ""
    ) {
      setMessage("Please fill all details.");
      return;
    }

    try {
      const response = await fetch(
        "http://13.233.131.84:5000/api/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: donation.name,
            email: donation.email,
            amount: donation.amount
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Donation submitted successfully! ❤️");

        setDonation({
          name: "",
          email: "",
          amount: ""
        });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Unable to connect to server.");
    }
  }

  /* Connected portal pages. The existing Sahayata home-page markup remains below. */
  const goHome = (target) => {
    if (target === "ngo") setPage("ngo");
    else if (target === "donor") setPage("donor");
    else setPage("home");
  };
  if (page === "ngo") return <AuthPortal role="ngo" onHome={() => setPage("home")} onNavigate={setPage} />;
  if (page === "donor") return <AuthPortal role="donor" onHome={() => setPage("home")} onNavigate={setPage} />;
  if (page === "ngo-dashboard") return <NGOWorkspace onHome={(target) => setPage(target === "ngo" ? "ngo" : "home")} />;
  if (page === "donor-dashboard") return <DonorDashboard onHome={goHome} onOrganizations={() => setPage("organizations")} />;
  if (page === "admin") return <AdminPortal onHome={() => setPage("home")} />;
  if (page === "organization-detail") return <OrganizationDetail organization={selectedOrganization} onHome={() => setPage("organizations")} onDonate={(requirement, organization) => { setSelectedDonationRequirement({ requirement, organization }); setPage("donation"); }} />;
  if (page === "donation") return <DonationPortal requirement={selectedDonationRequirement?.requirement} organization={selectedDonationRequirement?.organization} onClose={() => setPage("organization-detail")} onSuccess={() => { setMessage("Donation record created."); }} />;

  /* HOME PAGE */

  return (
    <div className="app sahayata-home">
      <nav className="navbar home-navbar">
        <a
          className="sahayata-brand"
          href="#home"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-symbol" aria-hidden="true">
            <svg viewBox="0 0 60 60" role="img">
              <circle cx="30" cy="18" r="9" fill="#d9ad55" />
              <path d="M30 2V7 M13 8L18 13 M47 8L42 13 M7 24H14 M46 24H53"
                stroke="#d9ad55" strokeWidth="3" strokeLinecap="round" />
              <path d="M7 31H53L47 39H13Z" fill="#7b302e" />
              <path d="M13 44H47L40 50H20Z" fill="#a54c3c" />
              <path d="M23 55H37" stroke="#7b302e" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>Sahayata</strong>
            <small>Connecting causes with compassion</small>
          </span>
        </a>
        <button
          className="hamburger-button"
          onClick={() => {
            setMenuOpen(true);
            setMenuNotice("");
          }}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
      </nav>
      {menuOpen && (
        <div
          className="side-panel-overlay"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="side-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="side-panel-header">
              <div>
                <h2>Sahayata</h2>
                <p>Connecting causes with compassion</p>
              </div>
              <button
                className="side-panel-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            <div className="side-panel-links">
              <button onClick={() => {
  setMenuOpen(false);
  setPage("home");
  setSelectedCause(null);
  setShowAllCauses(false);
}}>
  Home
</button>
              <button onClick={() => {
  setMenuOpen(false);
  setPage("causes");
}}>
  Our areas of work
</button>

              <button onClick={() => {
  setMenuOpen(false);
  setPage("journey");
}}>
  Our journey
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("organizations");
}}>
  Organizations
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("about");
}}>
  About Sahayata
</button>

<button
  onClick={() => {
    setMenuOpen(false);
    setPage("ngo");
  }}
>
  NGO Registration
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("donor");
}}>
  Donor login / register
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("ngo-dashboard");
}}>
  NGO dashboard
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("admin");
}}>
  Admin dashboard
</button>

<button onClick={() => {
  setMenuOpen(false);
  setPage("contact");
}}>
  Contact us
</button>
            </div>
            </aside>
            </div>
      )}

      {page === "home" && (
  <main>
        <section className="sahayata-hero" id="home">
          <div className="hero-photo-shade" />
          <div className="sahayata-hero-content">
            <span className="eyebrow">A COMMUNITY BUILT ON KINDNESS</span>
            <h1>Every act of kindness can change a life.</h1>
            <p>
              Discover organizations doing meaningful work, understand their
              stories, and find ways to support a better tomorrow.
            </p>
            <a className="gold-button" href="#organizations">
              Discover our community <span>↗</span>
            </a>
          </div>
          <div className="hero-caption">PURPOSE · PEOPLE · POSSIBILITY</div>
        </section>

        <section className="quote-section">
          <span className="quote-mark">“</span>
          <blockquote>
            Philanthropy begins with purpose and grows through participation.
          </blockquote>
          <p>One community. Many causes. A shared hope for change.</p>
          <div className="gold-divider" />
        </section>

        <section className="journey-section" id="journey">
          <div className="journey-photo">
            <div className="journey-photo-overlay" />
            <div className="journey-photo-text">
              <span className="eyebrow">THE STORY BEHIND SAHAYATA</span>
              <h2>A bridge between people who care and causes that matter.</h2>
            </div>
          </div>

          <div className="journey-copy">
            <span className="eyebrow">OUR JOURNEY</span>
            <h2>Making giving easier to understand.</h2>
            <p>
              Sahayata is designed as a shared platform where people can
              discover social organizations, learn about the work they do,
              and explore opportunities to contribute.
            </p>
            <p>
              We want every organization to have space to tell its story,
              explain its mission, and share the impact it hopes to create.
              The aim is to make the connection between communities and
              supporters clearer and more meaningful.
            </p>
            <a className="text-link" href="#about">Learn about our approach ↗</a>
          </div>
        </section>

        <section className="what-we-do-section" id="about">
          <div>
            <span className="eyebrow light-eyebrow">WHAT WE DO</span>
            <h2>Helping good work find the support it needs.</h2>
          </div>
          <p>
            Organizations can share their mission and activities. Visitors
            can explore their profiles and learn about their work. The
            platform is intended to support clearer communication and
            accountability between participating NGOs, the platform
            administrator, and potential supporters.
          </p>
          <p className="disclaimer">
            Sahayata is a student project prototype. NGO approval,
            verification, and formal reporting procedures are not yet
            implemented.
          </p>
        </section>

        <section className="about-section" id="about-sahayata">
  <div className="about-intro">
    <p className="about-eyebrow">OUR PURPOSE · OUR PROMISE</p>
    <h2>About Sahayata</h2>
    <p className="about-lead">
      Philanthropy begins with purpose and grows through participation.
    </p>
    <p className="about-description">
      Sahayata brings communities, supporters and non-governmental
      organizations closer together. Our aim is to help people discover
      meaningful causes, understand the work organizations do, and learn
      how they can contribute to positive change.
    </p>
  </div>

  <div className="about-quote">
    <p>
      “Every act of kindness can become a step towards a more
      compassionate world.”
    </p>
    <span className="quote-line"></span>
    <small>THE SAHAYATA PHILOSOPHY</small>
  </div>

  <div className="about-columns">
    <article className="about-info-card">
      <span className="about-number">01</span>
      <h3>Why Sahayata?</h3>
      <p>
        Many organizations do meaningful work but need greater visibility.
        Sahayata aims to make their missions and activities easier to
        discover, helping supporters connect with causes they care about.
      </p>
    </article>

    <article className="about-info-card">
      <span className="about-number">02</span>
      <h3>Stories That Matter</h3>
      <p>
        Each organization can have its own profile to share its journey,
        mission, activities, achievements and current needs, so visitors
        can understand the purpose behind its work.
      </p>
    </article>

    <article className="about-info-card">
      <span className="about-number">03</span>
      <h3>Responsible Support</h3>
      <p>
        Sahayata is designed to include an administrative review process
        for NGO information and reports. Formal verification and approval
        features are still planned for future development.
      </p>
    </article>
  </div>
</section>
<section className="causes-section" id="causes">
  <div className="section-heading">
    <span className="eyebrow">WHERE COMPASSION MEETS ACTION</span>
    <h2>Our Areas of Work</h2>
    <div className="gold-divider" />
    <p>Explore the causes that help communities grow stronger.</p>
  </div>

  {page === "home" && (
  <div className="cause-photo-grid">
    <button
  className="cause-photo-card education-photo"
  onClick={() => setSelectedCause("education")}
>
  <span>01 / LEARNING</span>
  <h3>Education</h3>
  <p>Opening doors to opportunity.</p>
  <span className="cause-explore">EXPLORE CAUSE ↗</span>
</button>

<button
  className="cause-photo-card health-photo"
  onClick={() => setSelectedCause("healthcare")}
>
  <span>02 / WELLBEING</span>
  <h3>Healthcare</h3>
  <p>Care and dignity for everyone.</p>
  <span className="cause-explore">EXPLORE CAUSE ↗</span>
</button>

<button
  className="cause-photo-card food-photo"
  onClick={() => setSelectedCause("food")}
>
  <span>03 / NOURISHMENT</span>
  <h3>Food & Nutrition</h3>
  <p>Helping communities access nourishing food.</p>
  <span className="cause-explore">EXPLORE CAUSE ↗</span>
</button>

<button
  className="cause-photo-card animal-photo"
  onClick={() => setSelectedCause("animals")}
>
  <span>04 / COMPASSION</span>
  <h3>Animal Welfare</h3>
  <p>Protecting animals with care and kindness.</p>
  <span className="cause-explore">EXPLORE CAUSE ↗</span>
</button>

<button
  className="cause-photo-card community-photo"
  onClick={() => setSelectedCause("women")}
>
  <span>05 / EMPOWERMENT</span>
  <h3>Women & Community Welfare</h3>
  <p>Building stronger, more inclusive communities.</p>
  <span className="cause-explore">EXPLORE CAUSE ↗</span>
</button>```
</div>
  )}
</section>
{selectedCause && (
  <p style={{ padding: "20px", background: "#fff0d5", color: "#702d3b" }}>
    Selected cause: {selectedCause}
  </p>
)}
{selectedCause && causeContent[selectedCause] && (
  <section className="cause-detail-section" id="cause-details">
    <h2>Organizations supporting this cause</h2>
            <p>
              Explore organizations and the programmes they support.
              Choose an organization to continue with your donation.
            </p>

            <div className="organization-grid">
              {(selectedCause === "education"
                ? [
                    {
                      name: "Helping Hand Foundation",
                      description:
                        "Supports school supplies, learning materials, and educational assistance.",
                      programs: "School kits · Learning resources",
                    },
                    {
                      name: "Bright Future Initiative",
                      description:
                        "Focuses on learning opportunities and educational guidance for young people.",
                      programs: "Learning support · Digital resources",
                    },
                  ]
                : selectedCause === "food"
                ? [
                    {
                      name: "Hope for All",
                      description:
                        "Supports community food assistance and essential supplies.",
                      programs: "Food distribution · Family support",
                    },
                  ]
                : selectedCause === "healthcare"
                ? [
                    {
                      name: "Hope for All",
                      description:
                        "Supports community assistance and access to essential resources.",
                      programs: "Community support · Essential supplies",
                    },
                  ]
                : selectedCause === "animals"
                ? [
                    {
                      name: "Animal Care Initiative",
                      description:
                        "A sample organization profile for animal welfare and care.",
                      programs: "Animal feeding · Shelter support",
                    },
                  ]
                : [
                    {
                      name: "Community Empowerment Initiative",
                      description:
                        "A sample organization profile for skills and community support.",
                      programs: "Skills development · Community support",
                    },
                  ]
              ).map((org) => (
                <article className="organization-card" key={org.name}>
                  <h3>{org.name}</h3>
                  <p>{org.description}</p>
                  <p>
                    <strong>Programmes:</strong> {org.programs}
                  </p>
                  <button
                    className="cause-back-button"
                    onClick={() => {
                      setSelectedOrganization({ id: null, name: org.name, category: causeContent[selectedCause]?.shortTitle || selectedCause, description: org.description, mission: org.description, programs: String(org.programs || "").split("·").map(x => x.trim()).filter(Boolean) });
                      setPage("organization-detail");
                    }}
                  >
                    View Organization
                  </button>
                </article>
              ))}
            </div>
    <RegisteredOrganizationCards cause={selectedCause} onOpen={(org) => { setSelectedOrganization(org); setPage("organization-detail"); }} />
    <button
      type="button"
      className="cause-back-button"
      onClick={() => setSelectedCause(null)}
    >
      ← Back to all areas of work
    </button>

    <p className="cause-detail-eyebrow">UNDERSTANDING THE NEED</p>

    <h2>{causeContent[selectedCause].title}</h2>

    <p className="cause-detail-intro">
      {causeContent[selectedCause].intro}
    </p>

    <div className="cause-detail-grid">
      <article className="cause-detail-card">
        <span>01</span>
        <h3>The challenges</h3>
        <p>{causeContent[selectedCause].challenges}</p>
      </article>

      <article className="cause-detail-card">
        <span>02</span>
        <h3>Sahayata's approach</h3>
        <p>{causeContent[selectedCause].approach}</p>
      </article>
    </div>

    <div className="cause-ngos-heading">
      <h3>Organizations working in {causeContent[selectedCause].shortTitle}</h3>
      <p>Discover organizations working in this cause area.</p>
    </div>

    <div className="cause-empty-state">
      NGO profiles will appear here when category registration
      and organization listings are connected.
    </div>
  </section>
)}


        <section className="organizations-section" id="organizations">
          <div className="section-heading">
            <span className="eyebrow">MEET THE PEOPLE MAKING A DIFFERENCE</span>
            <h2>Organizations in Our Community</h2>
            <div className="gold-divider" />
            <p>
              Every organization has a story. Get to know its mission,
              activities, and the community it serves.
            </p>
          </div>

          <div className="organization-intro-grid">
            <article className="organization-intro-card">
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85"
                alt="Students learning together"
                loading="lazy"
              />
              <div>
                <span className="organization-category">EDUCATION</span>
                <h3>Hope Education Trust</h3>
                <p>
                  A demonstration profile for an organization focused on
                  learning opportunities and educational support.
                </p>
                <span className="portfolio-note">
                  Sample profile · Not yet verified
                </span>
              </div>
            </article>

            <article className="organization-intro-card">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85"
                alt="People supporting children"
                loading="lazy"
              />
              <div>
                <span className="organization-category">COMMUNITY WELFARE</span>
                <h3>Helping Hand Foundation</h3>
                <p>
                  A demonstration profile for a community support
                  organization working to help families.
                </p>
                <span className="portfolio-note">
                  Sample profile · Not yet verified
                </span>
              </div>
            </article>

            <article className="organization-intro-card">
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=85"
                alt="A dog receiving care"
                loading="lazy"
              />
              <div>
                <span className="organization-category">ANIMAL WELFARE</span>
                <h3>Care for Animals</h3>
                <p>
                  A demonstration profile for an organization dedicated
                  to animal care and welfare.
                </p>
                <span className="portfolio-note">
                  Sample profile · Not yet verified
                </span>
              </div>
            </article>
          </div>

          <p className="demo-note">
            These are sample profiles for demonstrating the website layout.
            Individual NGO portfolio pages will be added in the next stage.
            Detailed requirements will belong inside each organization's
            portfolio, not on this main page.
          </p>
        </section>

        <section className="admin-purpose-section">
          <div className="admin-purpose-icon">✳</div>
          <span className="eyebrow">A CLEARER WAY TO CONNECT</span>
          <h2>Built around stories, responsibility, and trust.</h2>
          <p>
            The planned platform workflow allows NGOs to share information
            with an administrator, who can review submissions and monitor
            reports as those features are developed. Visitors can then
            explore the organizations and learn about their work.
          </p>
        </section>
      </main>
      )}
      
    {page === "causes" && (
  <main className="inner-page causes-page">
    <button
      className="back-home-button"
      onClick={() => setPage("home")}
    >
      ← Back to Home
    </button>

    <section className="causes-intro">
      <p className="eyebrow">WHERE YOUR KINDNESS GOES</p>
      <h1>Every Cause Deserves a Chance.</h1>
      <p>
        Explore the causes that need our attention. Choose a cause
        close to your heart and discover how your support can make
        a meaningful difference.
      </p>
    </section>

    <section className="cause-page-grid">
      {[
        {
          id: "education",
          title: "Education",
          image: "photo-1503676260728-1c00da094a0b",
          description:
            "Every child deserves the chance to learn, dream, and build a brighter future.",
        },
        {
          id: "healthcare",
          title: "Healthcare",
          image: "photo-1576091160399-112ba8d25d1d",
          description:
            "Help make essential healthcare and medical support more accessible to those in need.",
        },
        {
          id: "food",
          title: "Food & Nutrition",
          image: "photo-1488521787991-ed7bbaae773c",
          description:
            "Support efforts to bring nutritious meals and food security to vulnerable communities.",
        },
        {
          id: "animals",
          title: "Animal Welfare",
          image: "photo-1450778869180-41d0601e046e",
          description:
            "Help protect animals through care, nourishment, shelter, and compassion.",
        },
        {
          id: "women",
          title: "Women & Community Welfare",
          image: "photo-1531206715517-5c0ba140b2b8",
          description:
            "Support opportunities, dignity, and stronger communities for women and families.",
        },
      ].map((cause) => (
        <button
          className="cause-page-card"
          key={cause.id}
          onClick={() => {
            setSelectedCause(cause.id);
            setPage("cause-detail");
          }}
        >
          <img
            src={`https://images.unsplash.com/${cause.image}?auto=format&fit=crop&w=900&q=80`}
            alt={cause.title}
          />
          <div className="cause-page-card-content">
            <h2>{cause.title}</h2>
            <p>{cause.description}</p>
            <span>Explore this cause ↗</span>
          </div>
        </button>
      ))}
    </section>
  </main>
)}
{page === "cause-detail" && (
  <main className="inner-page cause-detail-page">
    <button
      className="back-home-button"
      onClick={() => setPage("causes")}
    >
      ← All Areas of Work
    </button>

    {(() => {
      const details = {
        education: {
          title: "Education for Every Child",
          image: "photo-1503676260728-1c00da094a0b",
          intro:
            "Education opens doors to opportunity. Every child deserves a safe place to learn, the tools to grow, and the freedom to dream beyond their circumstances.",
          matters:
            "Financial difficulties can prevent children from accessing school supplies, learning resources, and consistent educational support. Helping address these barriers gives children more opportunities to learn and thrive.",
          impact: [
            "School supplies and learning materials",
            "Access to educational resources",
            "Support for children facing financial barriers",
          ],
        },
        healthcare: {
          title: "Healthcare Within Everyone's Reach",
          image: "photo-1576091160399-112ba8d25d1d",
          intro:
            "Good health is fundamental to a dignified life. Communities need access to essential care, health awareness, and support during difficult times.",
          matters:
            "The cost and availability of healthcare can make it difficult for vulnerable families to seek timely assistance. Community support can help organizations address these needs.",
          impact: [
            "Essential medical supplies",
            "Health awareness initiatives",
            "Support for vulnerable patients",
          ],
        },
        food: {
          title: "Food & Nutrition",
          image: "photo-1488521787991-ed7bbaae773c",
          intro:
            "Nutritious food helps people stay healthy, learn, work, and live with dignity. Everyone deserves reliable access to nourishing meals.",
          matters:
            "Food insecurity affects health and everyday life. Supporting community food programmes can help organizations reach people who need assistance.",
          impact: [
            "Nutritious meals for people in need",
            "Community food distribution",
            "Food support for vulnerable families",
          ],
        },
        animals: {
          title: "Compassion for Every Animal",
          image: "photo-1450778869180-41d0601e046e",
          intro:
            "Animals deserve kindness, protection, and responsible care. Supporting animal welfare helps create safer communities for animals and people alike.",
          matters:
            "Stray and abandoned animals may lack food, shelter, and medical attention. Animal welfare organizations work to address these needs.",
          impact: [
            "Food and shelter",
            "Veterinary care and treatment",
            "Rescue and responsible animal care",
          ],
        },
        women: {
          title: "Stronger Women, Stronger Communities",
          image: "photo-1531206715517-5c0ba140b2b8",
          intro:
            "When women and communities have access to opportunities and support, they can build safer, stronger, and more inclusive futures.",
          matters:
            "Access to resources, education, skills, and community support can help people overcome barriers and participate more fully in society.",
          impact: [
            "Education and skill-building initiatives",
            "Community support programmes",
            "Opportunities for women and families",
          ],
        },
      };

      const cause = details[selectedCause];

      if (!cause) {
        return <p>Please select a cause from Areas of Work.</p>;
      }

      return (
        <>
          <div className="cause-detail-hero">
            <img src={`https://images.unsplash.com/${cause.image}?auto=format&fit=crop&w=1400&q=85`} alt={cause.title} />
            <div className="cause-detail-heading">
              <p className="eyebrow">UNDERSTAND THE CAUSE</p>
              <h1>{cause.title}</h1>
            </div>
          </div>

          <section className="cause-detail-copy">
            <h2>Why this cause matters</h2>
            <p>{cause.intro}</p>
            <p>{cause.matters}</p>

            <h2>How support can help</h2>
            <ul>
              {cause.impact.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

           <h2>Organizations supporting this cause</h2>

            <div className="organization-grid">
              {(selectedCause === "education"
                ? [
                    {
  name: "Helping Hand Foundation",
  image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  description: "Supports school supplies and educational resources for children.",
  programs: "School kits · Learning materials",
},
                    {
                      name: "Bright Future Initiative",
                      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
                      description: "Supports learning opportunities and educational guidance.",
                      programs: "Digital learning · Student support",
                    },
                  ]
                : selectedCause === "food"
                ? [
                    {
                      name: "Hope for All",
                      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
                      description: "Supports food assistance and essential supplies for families.",
                      programs: "Food distribution · Family support",
                    },
                  ]
                : selectedCause === "healthcare"
                ? [
                    {
                      name: "Hope for All",
                      description: "Supports community assistance and essential resources.",
                      programs: "Community support · Essential supplies",
                    },
                  ]
                : selectedCause === "animals"
                ? [
                    {
                      name: "Animal Care Initiative",
                      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80",
                      description: "Sample profile for animal rescue and welfare.",
                      programs: "Animal feeding · Shelter support",
                    },
                  ]
                : [
                    {
                      name: "Community Empowerment Initiative",
                      image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80",
                      description: "Sample profile for women's empowerment and skills development.",
                      programs: "Skills training · Community support",
                    },
                  ]
              ).map((org) => (
                <article className="organization-card" key={org.name}>
                  <img
    className="organization-card-image"
    src={org.image}
    alt={org.name}
  />
                  <h3>{org.name}</h3>
                  <p>{org.description}</p>
                  <p><strong>Programmes:</strong> {org.programs}</p>
                  <button
                    className="organization-area-button"
                    onClick={() => setPage("organizations")}
                  >
                    View Organization →
                  </button>
                </article>
              ))}
            </div>
            <button
              className="cause-back-button"
              onClick={() => setPage("causes")}
            >
              Explore Other Causes
            </button>
          </section>
        </>
      );
    })()}
  </main>
)}

    {page === "organizations" && (
  <section className="story-page organizations-page">
    <button
      className="back-home-button"
      onClick={() => setPage("home")}
    >
      ← Back to Home
    </button>

    <header className="page-heading">
      <span className="story-eyebrow">WORKING TOGETHER</span>
      <h1>Our Organizations</h1>

      <p>
        Positive change becomes possible when people, communities,
        and organizations work towards a shared purpose. Sahayata
        brings organization information together so visitors can
        explore different initiatives, understand their focus,
        and learn about the programs through which they aim to
        support people and communities.
      </p>

      <p>
        Explore the sample organizations below to see how their
        missions and programs can be presented on our platform.
      </p>
    </header>

    <div className="organization-grid">
      <article className="organization-card">
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85"
          alt="Children learning in a classroom"
        />

        <div className="organization-card-content">
          <span className="organization-category">EDUCATION</span>
          <h2>Helping Hand Foundation</h2>

          <p>
            Education can open doors to opportunities, confidence,
            and a brighter future. Helping Hand Foundation is a
            sample organization profile focused on educational
            support for children who may face barriers to learning.
            Its example programs demonstrate how access to school
            materials and learning resources can help children
            participate more fully in their education.
          </p>

          <h3>Programs</h3>
          <ul>
            <li>School supplies and stationery</li>
            <li>Educational learning materials</li>
            <li>Community learning assistance</li>
          </ul>
          <button className="organization-area-button" onClick={() => { setSelectedOrganization({ id: "ngo-helping-hand", name: "Helping Hand Foundation", category: "Education", city: "Bhubaneswar", state: "Odisha", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85", description: "Supports school supplies, learning materials, and educational assistance.", mission: "Make learning resources easier to access for children and families.", programs: ["School supplies and stationery", "Educational learning materials", "Community learning assistance"] }); setPage("organization-detail"); }}>View Organization Profile →</button>
          <button
  className="organization-area-button"
  onClick={() => {
    setSelectedCause("education");
    setPage("cause-detail");
  }}
>
  Explore Education →
</button>
        </div>
      </article>

      <article className="organization-card">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85"
          alt="Community members supporting children"
        />

        <div className="organization-card-content">
          <span className="organization-category">COMMUNITY CARE</span>
          <h2>Hope for All</h2>

          <p>
            Access to basic necessities plays an important role
            in helping families manage difficult circumstances.
            Hope for All is a sample organization profile that
            represents community support initiatives. Its
            demonstration programs focus on essential supplies,
            food assistance, and helping communities understand
            where support may be needed.
          </p>

          <h3>Programs</h3>
          <ul>
            <li>Food and ration assistance</li>
            <li>Essential supplies for families</li>
            <li>Community relief initiatives</li>
          </ul>
          <button className="organization-area-button" onClick={() => { setSelectedOrganization({ id: "ngo-hope-for-all", name: "Hope for All", category: "Food & Nutrition", city: "Cuttack", state: "Odisha", image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=85", description: "Community assistance focused on food, essential supplies and family support.", mission: "Help families access essential support with dignity.", programs: ["Food and ration assistance", "Essential supplies for families", "Community relief initiatives"] }); setPage("organization-detail"); }}>View Organization Profile →</button>
          <button
  className="organization-area-button"
  onClick={() => {
    setSelectedCause("food");
    setPage("cause-detail");
  }}
>
  Explore Food & Nutrition →
</button>

<button
  className="organization-area-button"
  onClick={() => {
    setSelectedCause("healthcare");
    setPage("cause-detail");
  }}
>
  Explore Healthcare →
</button>
        </div>
      </article>

      <article className="organization-card">
        <img
          src="https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=85"
          alt="Children participating in a group activity"
        />

        <div className="organization-card-content">
          <span className="organization-category">YOUTH DEVELOPMENT</span>
          <h2>Bright Future Initiative</h2>

          <p>
            Children and young people benefit from opportunities
            to learn, explore their interests, and develop new
            skills. Bright Future Initiative is a sample profile
            representing programs that encourage learning and
            personal development. Its example activities show
            how educational resources and skill-building
            opportunities can be organized on Sahayata.
          </p>

          <h3>Programs</h3>
          <ul>
            <li>Learning and skill-building activities</li>
            <li>Digital learning resources</li>
            <li>Educational guidance</li>
          </ul>
<button className="organization-area-button" onClick={() => { setSelectedOrganization({ id: "ngo-bright-future", name: "Bright Future Initiative", category: "Education", city: "Rourkela", state: "Odisha", image: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=85", description: "Learning opportunities, digital resources and educational guidance for young people.", mission: "Help young people build confidence and skills for the future.", programs: ["Learning and skill-building activities", "Digital learning resources", "Educational guidance"] }); setPage("organization-detail"); }}>View Organization Profile →</button>
          <button
            className="organization-area-button"
            onClick={() => {
              setSelectedCause("education");
              setPage("cause-detail");
            }}
          >
            Explore Education →
          </button>
        </div>
      </article>
    </div>

    <RegisteredOrganizationCards onOpen={(org) => { setSelectedOrganization(org); setPage("organization-detail"); }} />

    <div className="organizations-note">
      <h2>Many Causes, One Shared Purpose</h2>
      <p>
        Every organization has its own goals, approach, and
        community focus. By making their information easier to
        explore, Sahayata aims to help visitors understand the
        different ways social initiatives can contribute to
        positive change.
      </p>
      <p>
        These organization profiles are sample data for the
        project demonstration, not verified partner organizations.
      </p>
    </div>
  </section>
)}
{page === "journey" && (
  <section className="story-page journey-page">
    <button
      className="back-home-button"
      onClick={() => setPage("home")}
    >
      ← Back to Home
    </button>

    <div className="story-hero">
      <div className="story-hero-text">
        <span className="story-eyebrow">OUR STORY</span>
        <h1>Our Journey</h1>
        <h2>A small idea, a big dream, a lasting change.</h2>

        <p>
          Sahayata began with a simple belief: kindness should
          have the power to change lives. Every day, people want
          to help others, support meaningful causes, and contribute
          to a better society. However, finding the right cause
          and understanding how to support it can sometimes feel
          difficult. We imagined a platform that could bring
          people and social organizations closer together.
        </p>

        <p>
          From this idea came Sahayata — a platform designed to
          make discovering causes easier and to help visitors
          understand the work being done to support communities.
          Our journey is about turning the intention to help into
          an accessible, thoughtful, and meaningful experience.
        </p>
      </div>

      <img
        src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=85"
        alt="People coming together to support one another"
      />
    </div>

    <div className="story-cards">
      <article className="story-card">
        <span className="story-number">01</span>
        <h2>Where It Began</h2>
        <p>
          The idea behind Sahayata grew from recognizing the
          importance of connecting people who wish to contribute
          with organizations that work on social challenges.
          While generosity already exists in our communities,
          access to clear and organized information can make
          participation easier. We wanted to create a single
          place where visitors could explore causes, learn about
          initiatives, and discover different ways to contribute.
        </p>
      </article>

      <article className="story-card">
        <span className="story-number">02</span>
        <h2>Our Mission</h2>
        <p>
          Our mission is to make giving simpler, more accessible,
          and more meaningful. We aim to present information about
          causes and organizations in a clear and organized way,
          helping visitors understand the needs different programs
          seek to address. Through a straightforward digital
          experience, Sahayata hopes to encourage awareness,
          informed decisions, and a stronger spirit of community
          support.
        </p>
      </article>

      <article className="story-card">
        <span className="story-number">03</span>
        <h2>Our Progress</h2>
        <p>
          Sahayata is being developed as a platform where visitors
          can explore areas of work, discover sample organizations,
          and learn about their programs. The project brings
          together a user-friendly interface and supporting
          application features to demonstrate how information
          about social initiatives can be presented in one place.
          Each improvement helps us move towards a clearer and
          more useful experience for visitors.
        </p>
      </article>

      <article className="story-card">
        <span className="story-number">04</span>
        <h2>Looking Ahead</h2>
        <p>
          We hope to continue improving Sahayata with better
          access to information, clearer organization profiles,
          and technology that makes exploring causes easier.
          Our long-term vision is to encourage responsible
          participation and help people understand the value of
          collective action. We believe meaningful change begins
          when people are given the opportunity to care, learn,
          and take part.
        </p>
      </article>
    </div>

    <div className="story-banner">
      <img
        src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=85"
        alt="Volunteers working together"
      />

      <div>
        <span className="story-eyebrow">OUR BELIEF</span>
        <h2>Every act of kindness can be a beginning.</h2>
        <p>
          We want Sahayata to be a place where people can discover
          meaningful causes and take steps towards a more caring
          and supportive society. Together, small efforts can
          contribute to a larger purpose.
        </p>
      </div>
    </div>
  </section>
)}
{page === "ngo" && (
  <main className="inner-page ngo-registration-page">
    <button
      className="back-home-button"
      onClick={() => setPage("home")}
    >
      ← Back to Home
    </button>

    <header className="page-heading">
      <span className="story-eyebrow">JOIN SAHAYATA</span>
      <h1>Register Your NGO</h1>
      <p>
        Create your organization profile and help connect
        people with causes that matter.
      </p>
    </header>

    <form
      className="ngo-registration-form"
      onSubmit={async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const logoFile = formData.get("ngoLogo");

  if (!logoFile || logoFile.size === 0) {
    alert("Please select an NGO logo to test the S3 upload.");
    return;
  }

  const uploadData = new FormData();
  uploadData.append("logo", logoFile);

  try {
    const response = await fetch(
      "http://13.233.131.84:5000/api/upload-ngo-logo",
      {
        method: "POST",
        body: uploadData
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Upload failed.");
    }

    alert("NGO logo uploaded to AWS S3 successfully!");
    console.log("S3 upload result:", result);
  } catch (error) {
    console.error("S3 upload error:", error);
    alert("Logo upload failed: " + error.message);
  }
}}
    >
      <h2>Organization Details</h2>

      <label htmlFor="ngoName">NGO / Organization Name *</label>
      <input id="ngoName" name="ngoName" type="text" required />

      <label htmlFor="ngoEmail">Official Email Address *</label>
      <input id="ngoEmail" name="ngoEmail" type="email" required />

      <label htmlFor="ngoPhone">Contact Number *</label>
      <input
        id="ngoPhone"
        name="ngoPhone"
        type="tel"
        required
      />

      <label htmlFor="ngoLocation">City and State *</label>
      <input
        id="ngoLocation"
        name="ngoLocation"
        type="text"
        placeholder="e.g. Bhubaneswar, Odisha"
        required
      />

      <label htmlFor="ngoAddress">Full Organization Address *</label>
      <textarea
        id="ngoAddress"
        name="ngoAddress"
        rows="3"
        required
      />

      <label htmlFor="ngoDescription">About Your Organization *</label>
      <textarea
        id="ngoDescription"
        name="ngoDescription"
        rows="4"
        placeholder="Describe your mission and the communities you support."
        required
      />

      <label htmlFor="ngoLogo">Organization Logo or Photo</label>
<input
  id="ngoLogo"
  name="ngoLogo"
  type="file"
  accept="image/jpeg,image/png,image/webp"
/>

      <h2>Areas of Work</h2>
      <p>Select the causes your organization supports.</p>

      <div className="ngo-cause-options">
        <label>
          <input type="checkbox" name="causes" value="education" />
          Education
        </label>
        <label>
          <input type="checkbox" name="causes" value="healthcare" />
          Healthcare
        </label>
        <label>
          <input type="checkbox" name="causes" value="food" />
          Food and Hunger Relief
        </label>
        <label>
          <input type="checkbox" name="causes" value="animals" />
          Animal Welfare
        </label>
        <label>
          <input type="checkbox" name="causes" value="women" />
          Women Empowerment
        </label>
      </div>

      <h2>Legal Registration Details</h2>

      <label htmlFor="ngoType">Organization Type *</label>
      <select id="ngoType" name="ngoType" required defaultValue="">
        <option value="" disabled>Select organization type</option>
        <option value="trust">Trust</option>
        <option value="society">Society</option>
        <option value="section8">Section 8 Company</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="ngoRegistrationNumber">
        Registration Number
      </label>
      <input
        id="ngoRegistrationNumber"
        name="registrationNumber"
        type="text"
      />

      <label htmlFor="ngoDocument">
        Registration Certificate
      </label>
      <input
        id="ngoDocument"
        name="registrationDocument"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <h2>Account Setup</h2>

      <label htmlFor="ngoPassword">Create Password *</label>
      <input
        id="ngoPassword"
        name="password"
        type="password"
        minLength="8"
        autoComplete="new-password"
        required
      />

      <label htmlFor="ngoConfirmPassword">Confirm Password *</label>
      <input
        id="ngoConfirmPassword"
        name="confirmPassword"
        type="password"
        minLength="8"
        autoComplete="new-password"
        required
      />

      <label className="ngo-terms">
        <input type="checkbox" required />
        I confirm that the information provided is accurate.
      </label>

      <button type="submit" className="primary-button">
        Submit Registration
      </button>

      <p className="ngo-form-note">
        Registration submission and verification will be connected
        to the backend in the next step.
      </p>
    </form>
  </main>
)}
    {page === "about" && (
  <section className="story-page about-page">
    <button
      className="back-home-button"
      onClick={() => setPage("home")}
    >
      ← Back to Home
    </button>

    <div className="story-hero about-hero">
      <div className="story-hero-text">
        <span className="story-eyebrow">ABOUT US</span>
        <h1>About Sahayata</h1>
        <h2>Connecting kind hearts with meaningful causes.</h2>

        <p>
          Sahayata is a project designed to bring people who want
          to help closer to causes and social organizations that
          aim to make a difference. We believe that discovering
          meaningful initiatives should be simple and that useful
          information should be easy to understand. Our platform
          brings causes, organization profiles, and program
          information together in one accessible place.
        </p>

        <p>
          The name Sahayata reflects the idea of help and support.
          At the heart of this project is a simple purpose: to
          encourage awareness, make exploring social initiatives
          easier, and show how technology can support connections
          between people and causes.
        </p>
      </div>

      <img
        src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=85"
        alt="People joining hands for a community initiative"
      />
    </div>

    <div className="about-sections">
      <article className="about-feature">
        <span className="about-icon">♡</span>
        <h2>What We Do</h2>
        <p>
          Sahayata provides a place to explore areas of work,
          learn about sample organizations, and understand the
          programs associated with different causes. The platform
          is designed to make information easier to navigate,
          helping visitors discover initiatives that match their
          interests and understand the purpose behind them.
        </p>
      </article>

      <article className="about-feature">
        <span className="about-icon">✦</span>
        <h2>Our Vision</h2>
        <p>
          We envision a society where more people can discover
          ways to contribute to causes they care about. By making
          information accessible and presenting initiatives
          clearly, we hope to encourage awareness, participation,
          and a shared responsibility towards building stronger
          communities.
        </p>
      </article>

      <article className="about-feature">
        <span className="about-icon">❋</span>
        <h2>Our Values</h2>
        <p>
          Compassion encourages us to recognize the needs of
          others. Transparency means presenting clear information
          and being honest about what a platform can offer.
          Inclusivity encourages participation from different
          backgrounds, while collective action reminds us that
          individual efforts can contribute to a larger purpose.
        </p>
      </article>

      <article className="about-feature">
        <span className="about-icon">◎</span>
        <h2>Why Sahayata?</h2>
        <p>
          Finding relevant information about social causes and
          organizations can sometimes feel overwhelming. Sahayata
          aims to make this process more straightforward by
          bringing information together in one place. Our goal
          is to help visitors explore causes, learn about
          programs, and make more informed decisions about
          supporting social initiatives.
        </p>
      </article>
    </div>

    <div className="about-commitment">
      <h2>Our Commitment</h2>
      <p>
        We are committed to building a platform that is
        accessible, informative, and easy to use. As Sahayata
        develops, we aim to improve the way cause information
        is presented, make organization profiles clearer, and
        encourage responsible participation. We believe that
        technology can help people discover opportunities to
        contribute, provided that accurate information,
        transparency, and trust remain central to the experience.
      </p>
    </div>
  </section>
)}


      {showDonation && (
        <div className="modal-overlay">
          <div className="donation-modal">
            <button
              className="close-button"
              onClick={() => setShowDonation(false)}
              aria-label="Close donation form"
            >
              ✕
            </button>

            <div className="modal-heart">♡</div>
            <h2>Make a Contribution</h2>

            {selectedRequirement && (
              <div className="selected-ngo">
                <strong>Selected organization:</strong>
                <br />
                {selectedRequirement.ngoName}
                <br />
                <small>Requirement: {selectedRequirement.item}</small>
              </div>
            )}

            <p className="modal-subtitle">
              Thank you for wanting to make a difference.
            </p>

            <form onSubmit={submitDonation}>
              <input
                type="text"
                placeholder="Your Name"
                value={donation.name}
                onChange={(event) =>
                  setDonation({ ...donation, name: event.target.value })
                }
              />

              <input
                type="email"
                placeholder="Your Email"
                value={donation.email}
                onChange={(event) =>
                  setDonation({ ...donation, email: event.target.value })
                }
              />

              <input
                type="number"
                placeholder="Contribution Amount (₹)"
                value={donation.amount}
                onChange={(event) =>
                  setDonation({ ...donation, amount: event.target.value })
                }
              />

              <button type="submit" className="submit-donation">
                Continue
              </button>
            </form>

            {message && <p className="success-message">{message}</p>}
          </div>
        </div>
      )}

      <footer id="contact" className="sahayata-footer">
    <div className="footer-main">
      <div className="footer-brand">
        <h2>✦ Sahayata</h2>
        <p>Connecting causes with compassion.</p>
        <p>
          Every act of kindness can help build a stronger,
          more caring community.
        </p>
      </div>

      <div className="footer-contact">
        <h3>Get in Touch</h3>

        <a href="mailto:hello@sahayata.example">
          <span aria-hidden="true">✉</span>
          hello@sahayata.example
        </a>
        <a href="tel:+919000012345">
          <span aria-hidden="true">☎</span>
          +91 90000 12345 (demo contact)
        </a>

        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">◎</span>
          Instagram
        </a>

        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
          <span aria-hidden="true">f</span>
          Facebook
        </a>

        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
          <span aria-hidden="true">in</span>
          LinkedIn
        </a>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2026 Sahayata. All rights reserved.</p>
      <p>Made with care for a better tomorrow.</p>
    </div>
  </footer>
    </div>
   )}
    
export default App;