<script lang="ts">
  const base = import.meta.env.BASE_URL;
  const today = new Date().toLocaleDateString();
</script>

<div class="static-page">
  <div style="text-align: center;">
    <h1 style="font-size: 2.25rem;">Craniofacial Growth Percentiles</h1>
  </div>

  <h2>About this application</h2>

  <p>
    The percentile curves presented within this application were developed
    as part of the Craniofacial Growth Consortium Study (CGCS). This study
    combined data from eight of the growth studies making up the AAOF
    Legacy Collection. Data used in this study come from 17,290 serial
    lateral cephalographs from 2,100 individuals (1,056 males, 1,044
    females) with a median of 9 cephalographs per person. Methodology
    regarding data collection and analysis are presented in
    <a
      href="https://anatomypubs.onlinelibrary.wiley.com/doi/10.1002/ar.24520"
      target="_blank"
      rel="noreferrer">Sherwood et al., 2021</a
    >. Linear measures presented here have all been corrected for
    radiographic enlargement based on the protocols used in the study of
    origin. When submitting data to the application from other
    cephalographs, care must be taken to correct for enlargement based on
    the protocol used. Modern imaging techniques such as CT, CBCT, and MRI
    typically account for scaling during the scanning process. If that is
    the case, linear data collected from those images need not be further
    corrected. Please note that measures from cephalographs including
    points that are off midline (e.g., condylion, gonion, etc.) will
    suffer from foreshortening or elongation due to the projection of
    three-dimensional structures onto a two-dimensional plane. Therefore,
    caution should be used when submitting those measures to the
    application if they have been collected from 3D source (CT, CBCT,
    MRI).
  </p>

  <h3>Note</h3>

  <p>
    Craniofacial growth can be affected by many factors. This software is
    not intended for use for medical diagnostic or treatment purposes. The
    authors and their affiliated institutions are not liable for any
    damages to users or third parties arising from the use of this
    software.
  </p>

  <p>
    This software is protected under international copyright law.
    Unauthorized duplication or distribution is a violation of copyright.
    Use of this web application implies acceptance of the conditions
    stated above. These tools were developed by the Craniofacial Growth
    Consortium Study.
  </p>

  <h2>Citation</h2>

  <p>
    Middleton, K.M., Ramirez, G.G., Oh, H.S., Sherwood, R.J. (2024)
    Age-based Craniofacial Growth Percentile Charts. Retrieved {today} from
    the American Association of Orthodontists Foundation Legacy
    Collection.
    <a
      href="https://www.aaoflegacycollection.org/aaof_craniofacialGrowth.html"
      target="_blank"
      rel="noreferrer"
      >https://www.aaoflegacycollection.org/aaof_craniofacialGrowth.html</a
    >
  </p>

  <h2>Supporting publications</h2>

  <ul>
    <li>
      <a
        href="https://linkinghub.elsevier.com/retrieve/pii/S0889540626000247"
        target="_blank"
        rel="noreferrer"
        >Oh, H., K. M. Middleton, M. Valiathan, D. L. Duren, K. P.
        McNulty, J. A. McNamara Jr, M. Hans, and R. J. Sherwood. 2026.
        Craniofacial growth percentile curves: A clinical tool from the
        Craniofacial Growth Consortium Study. Am. J. Orthod. Dentofacial
        Orthop., doi: 10.1016/j.ajodo.2025.11.026.</a
      >
    </li>
    <li>
      Sherwood RJ, Duren DL, McNulty KP, Valiathan M, Oh HS, Middleton KM.
      2022. New standards for craniofacial growth. International
      Conference on Children's Bone Health. Dublin, Ireland. J. Bone Min.
      Res. PLUS 6:e10676, p.225 (Poster 113).
    </li>
    <li>
      Oh HS, Sherwood RJ, McNulty KP, Duren DL, Valiathan M, Middleton KM.
      2022. Craniofacial growth percentiles based on the CGCS. Annual
      Meeting of the International Association of Dental Research.
      Chengdu, China. J. Dent. Res. 101(B): Final Presentation ID: 1518
    </li>
  </ul>

  <h2>Funding</h2>

  <ul>
    <li>
      American Association of Orthodontists Foundation. J.A. McNamara
      (MPI), H.S. Oh (MPI), M.G. Hans (MPI). The AAOF Craniofacial Growth
      Legacy Collection.
    </li>
    <li>
      Sherwood RJ/Oh HS (Multiple PI). NIH NIDCR R01DE024732. Craniofacial
      Growth Prediction in Different Facial Types
    </li>
    <li>
      Sherwood RJ/Oh HS (Multiple PI). NIH NIDCR R01DE024732-06S1.
      Craniofacial Growth Prediction in Different Facial Types: Bayesian
      and Machine Learning Models
    </li>
  </ul>

  <p>
    This web application was developed at the
    <a
      href="https://medicine.missouri.edu/centers-institutes-labs/craniofacial-research-center"
      target="_blank"
      rel="noreferrer">University of Missouri Craniofacial Research Center</a
    >.
  </p>

  <div class="figure-block">
    <img
      src="{base}img/MU_MizzouSig_rgb_Black_Horiz.png"
      alt="University of Missouri"
      style="width: 25%;"
    />
  </div>

  <p>
    Funding for the Craniofacial Legacy Collection is provided by the
    American Association of Orthodontists Foundation.
  </p>

  <div class="figure-block">
    <img
      src="{base}img/aaof-aao-logo2022.png"
      alt="American Association of Orthodontists Foundation"
      style="width: 25%;"
    />
  </div>
</div>
